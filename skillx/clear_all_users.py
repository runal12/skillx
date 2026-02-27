#!/usr/bin/env python
import os
import django
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Delete all registered users and their associated data'

    def handle(self, *args, **options):
        # Confirm before deletion
        confirm = input('⚠️  WARNING: This will delete ALL registered users and their data (messages, connections, requests). Are you sure you want to continue? (yes/no): ')
        
        if confirm.lower() != 'yes':
            self.stdout.write('❌ Deletion cancelled. No data was modified.')
            return
        
        self.stdout.write('🗑️ Deleting all registered users and their associated data...')
        
        try:
            # Get database connection
            with connection.cursor() as cursor:
                # Delete all messages
                cursor.execute("DELETE FROM accounts_message")
                deleted_messages = cursor.rowcount
                self.stdout.write(f'   ✅ Deleted {deleted_messages} messages')
                
                # Delete all connection requests
                cursor.execute("DELETE FROM accounts_connectionrequest")
                deleted_requests = cursor.rowcount
                self.stdout.write(f'   ✅ Deleted {deleted_requests} connection requests')
                
                # Delete all users
                cursor.execute("DELETE FROM accounts_user")
                deleted_users = cursor.rowcount
                self.stdout.write(f'   ✅ Deleted {deleted_users} users')
                
                # Reset auto-increment sequences
                cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('accounts_user_id_seq', 'accounts_message_id_seq', 'accounts_connectionrequest_id_seq')")
                self.stdout.write('   ✅ Reset auto-increment sequences')
            
            connection.commit()
            self.stdout.write('✅ Database cleared successfully!')
            
        except Exception as e:
            self.stdout.write(f'❌ Error during deletion: {str(e)}')
            return
        
        self.stdout.write('🎉 All user data has been permanently deleted!')
        self.stdout.write('💡 You can now register fresh users to test the system.')
