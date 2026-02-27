from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from .models import User, Message

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """
    Get all conversations for authenticated user
    """
    try:
        user = request.user
        conversations = []
        
        # Get all messages where user is sender or receiver
        sent_messages = Message.objects.filter(sender=user).order_by('timestamp')
        received_messages = Message.objects.filter(receiver=user).order_by('timestamp')
        
        # Combine and sort messages chronologically (oldest first)
        all_messages = list(sent_messages) + list(received_messages)
        all_messages.sort(key=lambda x: x.timestamp)
        
        # Group messages by conversation (other user)
        conversation_dict = {}
        for message in all_messages:
            other_user = message.receiver if message.sender == user else message.sender
            
            # Create conversation key
            conv_key = f"{min(user.id, other_user.id)}_{max(user.id, other_user.id)}"
            
            if conv_key not in conversation_dict:
                conversation_dict[conv_key] = {
                    'id': len(conversation_dict) + 1,
                    'other_user_id': other_user.id,
                    'other_user_username': other_user.username,
                    'other_user_email': other_user.email,
                    'other_user_skills': other_user.skills_have,
                    'last_message': message.content,
                    'last_message_timestamp': message.timestamp,
                    'unread_count': 0,
                    'messages': []
                }
            
            # Add message to conversation
            conversation_dict[conv_key]['messages'].append({
                'id': message.id,
                'content': message.content,
                'timestamp': message.timestamp.isoformat(),
                'sender_id': message.sender.id,
                'is_from_me': message.sender == user,
                'is_read': message.is_read
            })
            
            # Update last message and timestamp
            if message.timestamp > conversation_dict[conv_key]['last_message_timestamp']:
                conversation_dict[conv_key]['last_message'] = message.content
                conversation_dict[conv_key]['last_message_timestamp'] = message.timestamp
            
            # Count unread messages (messages received but not read)
            if message.receiver == user and not message.is_read:
                conversation_dict[conv_key]['unread_count'] += 1
        
        # Convert to list and sort by last message timestamp
        conversations_list = list(conversation_dict.values())
        conversations_list.sort(key=lambda x: x['last_message_timestamp'], reverse=True)
        
        # Convert timestamps to strings for JSON serialization
        for conv in conversations_list:
            conv['last_message_timestamp'] = conv['last_message_timestamp'].isoformat()
        
        return Response(conversations_list)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
