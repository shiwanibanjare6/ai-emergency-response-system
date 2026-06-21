from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.responders.models import Responder, ResponderType, ResponderStatus
from apps.hospitals.models import Hospital

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds mock data for AI Emergency Response Coordination System'

    def handle(self, *args, **options):
        self.stdout.write('Deleting old mock data...')
        # Clear existing
        Responder.objects.all().delete()
        Hospital.objects.all().delete()
        # Delete only our specific mock users to avoid deleting superusers
        User.objects.filter(username__in=[
            'citizen1', 'dispatcher1', 'responder_unit1', 
            'responder_unit2', 'responder_unit3', 'hospital_staff1'
        ]).delete()

        self.stdout.write('Creating mock users...')
        
        # 1. Citizen
        User.objects.create_user(
            username='citizen1',
            email='citizen1@example.com',
            password='password123',
            role='citizen',
            phone='+1234567890',
            first_name='John',
            last_name='Doe'
        )
        
        # 2. Dispatcher
        User.objects.create_user(
            username='dispatcher1',
            email='dispatcher1@example.com',
            password='password123',
            role='dispatcher',
            phone='+1234567891',
            first_name='Sarah',
            last_name='Smith'
        )

        # 3. Responders
        resp_user1 = User.objects.create_user(
            username='responder_unit1',
            email='ambulance1@example.com',
            password='password123',
            role='responder',
            phone='+1234567892',
            first_name='Ambulance',
            last_name='Unit 1'
        )
        resp_user2 = User.objects.create_user(
            username='responder_unit2',
            email='police1@example.com',
            password='password123',
            role='responder',
            phone='+1234567893',
            first_name='Patrol',
            last_name='Unit 1'
        )
        resp_user3 = User.objects.create_user(
            username='responder_unit3',
            email='fire1@example.com',
            password='password123',
            role='responder',
            phone='+1234567894',
            first_name='Fire',
            last_name='Engine 1'
        )

        # 4. Hospital Staff
        User.objects.create_user(
            username='hospital_staff1',
            email='hospital1@example.com',
            password='password123',
            role='hospital',
            phone='+1234567895',
            first_name='Mercy',
            last_name='Reception'
        )

        self.stdout.write('Creating responder profiles...')
        # Responder 1 (Ambulance) - Close to center
        Responder.objects.create(
            user=resp_user1,
            type=ResponderType.AMBULANCE,
            status=ResponderStatus.AVAILABLE,
            lat=40.7128,
            lng=-74.0060
        )
        # Responder 2 (Police) - A bit further
        Responder.objects.create(
            user=resp_user2,
            type=ResponderType.POLICE,
            status=ResponderStatus.AVAILABLE,
            lat=40.7250,
            lng=-74.0100
        )
        # Responder 3 (Fire) - East side
        Responder.objects.create(
            user=resp_user3,
            type=ResponderType.FIRE,
            status=ResponderStatus.AVAILABLE,
            lat=40.7180,
            lng=-74.0010
        )

        self.stdout.write('Creating hospitals...')
        # Hospital A
        Hospital.objects.create(
            name='City General Hospital',
            lat=40.7150,
            lng=-74.0090,
            total_beds=100,
            available_beds=25
        )
        # Hospital B
        Hospital.objects.create(
            name='St. Jude Medical Center',
            lat=40.7300,
            lng=-74.0020,
            total_beds=150,
            available_beds=5
        )
        # Hospital C (Full)
        Hospital.objects.create(
            name='Mercy Health Clinic',
            lat=40.7050,
            lng=-74.0040,
            total_beds=50,
            available_beds=0
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded mock database data!'))
