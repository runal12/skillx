from django.urls import path
from .views import MyConnectionsView, RegisterView, SearchUsersView, SendConnectionRequestView, UserListView, AcceptConnectionRequestView, PendingRequestsView, UserProfileView, UserDetailView, RejectConnectionRequestView, LogoutView, DeleteAccountView, SendMessageView, DeleteMessageView, DeleteConversationView, RemoveConnectionView, MarkMessagesAsReadView
from .conversations_view import get_conversations
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
    path("users/", UserListView.as_view()),
    path("search/", SearchUsersView.as_view()),
    path("send-request/", SendConnectionRequestView.as_view()),
    path("pending-requests/", PendingRequestsView.as_view()),
    path("accept-request/", AcceptConnectionRequestView.as_view()),
    path("reject-request/", RejectConnectionRequestView.as_view()),
    path("my-connections/", MyConnectionsView.as_view()),
    path("connections/<int:connection_id>/", RemoveConnectionView.as_view()),
    path("conversations/", get_conversations),
    path("send-message/", SendMessageView.as_view()),
    path("delete-message/<int:message_id>/", DeleteMessageView.as_view()),
    path("delete-conversation/<int:user_id>/", DeleteConversationView.as_view()),
    path("mark-messages-read/<int:user_id>/", MarkMessagesAsReadView.as_view()),
    path("delete-account/", DeleteAccountView, name='delete_account'),
]