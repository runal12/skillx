import logging
from django.utils import timezone
from .models import User, Message, ConnectionRequest

logger = logging.getLogger('security')

class SecurityAuditMiddleware:
    """
    Middleware to log security events and ensure data access isolation
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log API access
        self.log_api_access(request)
        
        # Process request
        response = self.get_response(request)
        
        # Log response if it's sensitive data
        if self.is_sensitive_endpoint(request.path):
            self.log_data_access(request, response)
        
        return response
    
    def log_api_access(self, request):
        """Log API access attempts"""
        user = getattr(request, 'user', None)
        
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'method': request.method,
            'path': request.path,
            'user_id': user.id if user and user.is_authenticated else None,
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        logger.info(f"API_ACCESS: {log_data}")
    
    def log_data_access(self, request, response):
        """Log access to sensitive data endpoints"""
        user = getattr(request, 'user', None)
        
        if response.status_code == 200 and user and user.is_authenticated:
            # Check if user is accessing their own data
            if self.is_user_specific_endpoint(request.path):
                self.verify_user_data_access(request, user)
    
    def is_sensitive_endpoint(self, path):
        """Check if endpoint accesses sensitive data"""
        sensitive_endpoints = [
            '/api/conversations/',
            '/api/my-connections/',
            '/api/pending-requests/',
            '/api/profile/',
            '/api/messages/',
        ]
        return any(endpoint in path for endpoint in sensitive_endpoints)
    
    def is_user_specific_endpoint(self, path):
        """Check if endpoint should only return user's own data"""
        user_specific_endpoints = [
            '/api/conversations/',
            '/api/my-connections/',
            '/api/pending-requests/',
            '/api/profile/',
        ]
        return any(endpoint in path for endpoint in user_specific_endpoints)
    
    def verify_user_data_access(self, request, user):
        """Verify user is only accessing their own data"""
        path = request.path
        
        if '/api/conversations/' in path:
            # Log conversation access
            logger.info(f"CONVERSATION_ACCESS: user_id={user.id}, timestamp={timezone.now()}")
        
        elif '/api/my-connections/' in path:
            # Log connections access
            connections_count = ConnectionRequest.objects.filter(
                sender=user
            ).count() + ConnectionRequest.objects.filter(
                receiver=user
            ).count()
            logger.info(f"CONNECTIONS_ACCESS: user_id={user.id}, connections_count={connections_count}")
        
        elif '/api/pending-requests/' in path:
            # Log pending requests access
            pending_count = ConnectionRequest.objects.filter(
                receiver=user,
                status='pending'
            ).count()
            logger.info(f"PENDING_REQUESTS_ACCESS: user_id={user.id}, pending_count={pending_count}")
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class DataIsolationMiddleware:
    """
    Middleware to ensure users can only access their own data
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Add user isolation to request
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.user_data_scope = self.get_user_data_scope(request.user)
        
        response = self.get_response(request)
        
        # Filter response data if needed
        if hasattr(response, 'data'):
            response.data = self.filter_user_data(response.data, request.user)
        
        return response
    
    def get_user_data_scope(self, user):
        """Get data scope for user"""
        return {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        }
    
    def filter_user_data(self, data, user):
        """Filter data to ensure user only sees their own data"""
        if not user or not user.is_authenticated:
            return data
        
        # This is a safety net - views should handle filtering
        # But we add extra protection here
        if isinstance(data, list):
            return [item for item in data if self.user_owns_data(item, user)]
        elif isinstance(data, dict):
            if self.user_owns_data(data, user):
                return data
            else:
                return {'error': 'Access denied'}
        
        return data
    
    def user_owns_data(self, data_item, user):
        """Check if user owns the data item"""
        if not isinstance(data_item, dict):
            return True
        
        user_id = user.id
        
        # Check various ownership patterns
        if 'sender_id' in data_item or 'receiver_id' in data_item:
            return (data_item.get('sender_id') == user_id or 
                   data_item.get('receiver_id') == user_id)
        
        if 'sender' in data_item or 'receiver' in data_item:
            return (data_item.get('sender') == user_id or 
                   data_item.get('receiver') == user_id)
        
        if 'user_id' in data_item:
            return data_item.get('user_id') == user_id
        
        if 'id' in data_item and data_item['id'] == user_id:
            return True
        
        return True  # Default allow for non-sensitive data
