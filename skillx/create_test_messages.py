import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillx.settings')
django.setup()

from accounts.models import User, Message

def create_test_messages():
    # Get or create test users
    user1, created = User.objects.get_or_create(
        username='testuser1',
        defaults={
            'email': 'test1@example.com',
            'password': 'testpass123'
        }
    )
    
    user2, created = User.objects.get_or_create(
        username='testuser2',
        defaults={
            'email': 'test2@example.com',
            'password': 'testpass123'
        }
    )
    
    # Create some test messages
    messages = [
        {
            'sender': user1,
            'receiver': user2,
            'content': 'Hey! I saw you know React. Can you help me with a project?'
        },
        {
            'sender': user2,
            'receiver': user1,
            'content': 'Sure! I\'d be happy to help. What do you need?'
        },
        {
            'sender': user1,
            'receiver': user2,
            'content': 'I\'m building a skill exchange platform and need some React expertise.'
        }
    ]
    
    for msg_data in messages:
        Message.objects.get_or_create(
            sender=msg_data['sender'],
            receiver=msg_data['receiver'],
            content=msg_data['content'],
            defaults={'is_read': False}
        )
    
    print("Test messages created successfully!")
    print(f"User1: {user1.username}")
    print(f"User2: {user2.username}")
    print(f"Total messages: {Message.objects.count()}")

if __name__ == '__main__':
    create_test_messages()
