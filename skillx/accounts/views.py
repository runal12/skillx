from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import models

from accounts.serializers import RegisterSerializer, UserSerializer, ConnectionRequestSerializer, UserProfileUpdateSerializer, MessageSerializer
from .models import ConnectionRequest, User, Message

# Create your views here.

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get users that are not the current user and not already connected
        users = User.objects.exclude(id=request.user.id)
        
        # Exclude users that are already connected with the current user
        connected_users = ConnectionRequest.objects.filter(
            status='accepted'
        ).filter(
            models.Q(sender=request.user) | models.Q(receiver=request.user)
        )
        
        # Get the IDs of connected users
        connected_user_ids = set()
        for conn in connected_users:
            if conn.sender != request.user:
                connected_user_ids.add(conn.sender.id)
            if conn.receiver != request.user:
                connected_user_ids.add(conn.receiver.id)
        
        # Exclude connected users from the discover list
        users = users.exclude(id__in=connected_user_ids)
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
class SearchUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skill = request.query_params.get('skill')
        username = request.query_params.get('username')
        query = request.query_params.get('q')  # General search term

        if not skill and not username and not query:
            return Response({"error": "Search term required (skill, username, or q)"}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.exclude(id=request.user.id)
        
        # Search by skill
        if skill:
            users = users.filter(skills_have__icontains=skill)
        
        # Search by username
        elif username:
            users = users.filter(username__icontains=username)
        
        # General search (search in both skills and username)
        elif query:
            users = users.filter(
                models.Q(skills_have__icontains=query) |
                models.Q(username__icontains=query)
            )
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    

class SendConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get("receiver_id")

        if not receiver_id:
            return Response({"error": "receiver_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if int(receiver_id) == request.user.id:
            return Response({"error": "Cannot send to yourself"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Prevent sending request to already connected users
        already_connected = ConnectionRequest.objects.filter(
            status="accepted"
        ).filter(
            Q(sender=request.user, receiver=receiver) |
            Q(sender=receiver, receiver=request.user)
        ).exists()

        if already_connected:
            return Response({"error": "Already connected with this user"}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate request
        existing = ConnectionRequest.objects.filter(
            sender=request.user,
            receiver=receiver
        ).exists()

        if existing:
            return Response({"error": "Request already sent"}, status=status.HTTP_400_BAD_REQUEST)

        ConnectionRequest.objects.create(
            sender=request.user,
            receiver=receiver
        )

        return Response({"message": "Request sent"}, status=status.HTTP_201_CREATED)
    

class MyConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get both sent and received accepted connections
        connections = ConnectionRequest.objects.filter(
            status="accepted"
        ).filter(
            Q(sender=request.user) | Q(receiver=request.user)
        )
        
        serializer = ConnectionRequestSerializer(connections, many=True)
        return Response(serializer.data)
    


class PendingRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending_requests = ConnectionRequest.objects.filter(
            receiver=request.user,
            status='pending'
        )
        
        serializer = ConnectionRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)


class AcceptConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request_id = request.data.get("request_id")
        
        try:
            connection_request = ConnectionRequest.objects.get(
                id=request_id,
                receiver=request.user,
                status='pending'
            )
        except ConnectionRequest.DoesNotExist:
            return Response({"error": "Request not found or already processed"}, status=status.HTTP_404_NOT_FOUND)
        
        connection_request.status = 'accepted'
        connection_request.save()
        
        return Response({"message": "Connection accepted"}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteAccountView(request):
    try:
        user = request.user
        password = request.data.get('password')
        
        # Verify password before deletion
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete user and all related data
        user.delete()
        
        return Response(
            {'message': 'Account deleted successfully'}, 
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete account'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get("receiver_id")
        content = request.data.get("content")

        if not receiver_id or not content:
            return Response({"error": "receiver_id and content are required"}, status=status.HTTP_400_BAD_REQUEST)

        if int(receiver_id) == request.user.id:
            return Response({"error": "Cannot send message to yourself"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create message
        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            content=content
        )

        # Serialize and return message
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        try:
            message = Message.objects.get(
                id=message_id,
                sender=request.user  # Only sender can delete their own messages
            )
            message.delete()
            return Response({"message": "Message deleted successfully"}, status=status.HTTP_200_OK)
        except Message.DoesNotExist:
            return Response({"error": "Message not found or you don't have permission to delete it"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            # Delete all messages between current user and the specified user
            Message.objects.filter(
                (Q(sender=request.user, receiver_id=user_id) |
                 Q(sender_id=user_id, receiver=request.user))
            ).delete()
            return Response({"message": "Conversation deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RejectConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request_id = request.data.get("request_id")
        
        try:
            connection_request = ConnectionRequest.objects.get(
                id=request_id,
                receiver=request.user,
                status='pending'
            )
        except ConnectionRequest.DoesNotExist:
            return Response({"error": "Request not found or already processed"}, status=status.HTTP_404_NOT_FOUND)
        
        connection_request.delete()
        return Response({"message": "Connection request rejected"}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # In a real implementation, you might want to blacklist the token
        # For JWT, this is typically handled client-side by deleting the token
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteAccountView(request):
    try:
        user = request.user
        password = request.data.get('password')
        
        # Verify password before deletion
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete user and all related data
        user.delete()
        
        return Response(
            {'message': 'Account deleted successfully'}, 
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete account'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



class RemoveConnectionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, connection_id):
        try:
            # Get the connection to remove
            connection = ConnectionRequest.objects.get(id=connection_id)
            
            # Check if the current user is part of this connection
            if connection.sender != request.user and connection.receiver != request.user:
                return Response(
                    {"error": "Permission denied"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Delete the connection
            connection.delete()
            
            return Response(
                {"message": "Connection removed successfully"}, 
                status=status.HTTP_200_OK
            )
        except ConnectionRequest.DoesNotExist:
            return Response(
                {"error": "Connection not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkMessagesAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            # Mark all messages from the specified user to current user as read
            messages_updated = Message.objects.filter(
                sender_id=user_id,
                receiver=request.user,
                is_read=False
            ).update(is_read=True)
            
            return Response({
                'message': f'Marked {messages_updated} messages as read',
                'messages_updated': messages_updated
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': 'Failed to mark messages as read'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
