from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.responders.models import Responder, ResponderType, ResponderStatus
from apps.hospitals.models import Hospital
from apps.emergencies.models import Emergency, EmergencyStatus
from apps.notifications.models import Notification

User = get_user_model()


class EndToEndEmergencySystemTest(APITestCase):

    def setUp(self):
        # Create users
        self.citizen = User.objects.create_user(
            username='test_citizen', password='password123', role='citizen', phone='+1000000000'
        )
        self.dispatcher = User.objects.create_user(
            username='test_dispatcher', password='password123', role='dispatcher', phone='+1000000001'
        )
        self.responder_user = User.objects.create_user(
            username='test_responder', password='password123', role='responder', phone='+1000000002'
        )
        self.hospital_user = User.objects.create_user(
            username='test_hospital', password='password123', role='hospital', phone='+1000000003'
        )

        # Create Responder profile
        self.responder = Responder.objects.create(
            user=self.responder_user,
            type=ResponderType.AMBULANCE,
            status=ResponderStatus.AVAILABLE,
            lat=40.7128,
            lng=-74.0060
        )

        # Create Hospital
        self.hospital = Hospital.objects.create(
            name='Test Hospital',
            lat=40.7150,
            lng=-74.0090,
            total_beds=10,
            available_beds=5
        )

    def get_jwt_token(self, username, password):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': username, 'password': password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data['access']

    def test_end_to_end_flow(self):
        # 1. Citizen reports an emergency
        citizen_token = self.get_jwt_token('test_citizen', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {citizen_token}')

        report_url = reverse('emergency-report')
        payload = {
            'description': 'Help! There is a major car accident with a fire and person unconscious!',
            'lat': 40.7130,
            'lng': -74.0070
        }
        
        response = self.client.post(report_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        emergency_id = response.data['id']
        
        # Verify that AI auto-analysis ran and classified severity (critical because of fire/unconscious keywords)
        self.assertEqual(response.data['severity'], 'critical')

        # Verify that dispatcher was notified of new emergency
        dispatcher_token = self.get_jwt_token('test_dispatcher', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {dispatcher_token}')
        
        notif_list_url = reverse('notification-list')
        notif_response = self.client.get(notif_list_url)
        self.assertEqual(notif_response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(notif_response.data) > 0)
        self.assertIn("New emergency", notif_response.data[0]['message'])

        # 2. Dispatcher requests AI recommendations
        # Suggest Dispatch Units
        suggest_dispatch_url = reverse('ai-suggest-dispatch', kwargs={'id': emergency_id})
        dispatch_response = self.client.get(suggest_dispatch_url)
        self.assertEqual(dispatch_response.status_code, status.HTTP_200_OK)
        
        # Verify recommended unit type
        self.assertIn(dispatch_response.data['recommended_type'], ['fire', 'ambulance', 'police'])
        self.assertTrue(len(dispatch_response.data['recommendations']) > 0)
        self.assertEqual(dispatch_response.data['recommendations'][0]['responder']['id'], self.responder.id)

        # Suggest Hospital
        suggest_hospital_url = reverse('ai-suggest-hospital', kwargs={'id': emergency_id})
        hospital_response = self.client.get(suggest_hospital_url)
        self.assertEqual(hospital_response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(hospital_response.data['recommendations']) > 0)
        self.assertEqual(hospital_response.data['recommendations'][0]['hospital']['id'], self.hospital.id)

        # 3. Dispatcher assigns the responder to the emergency
        assign_url = reverse('emergency-assign', kwargs={'id': emergency_id})
        assign_payload = {'responder_id': self.responder.id}
        assign_response = self.client.patch(assign_url, assign_payload)
        self.assertEqual(assign_response.status_code, status.HTTP_200_OK)
        
        # Verify status changed to ASSIGNED and responder is busy
        self.assertEqual(assign_response.data['status'], 'assigned')
        self.responder.refresh_from_db()
        self.assertEqual(self.responder.status, ResponderStatus.BUSY)

        # Verify citizen got notified of assignment
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {citizen_token}')
        citizen_notif = self.client.get(notif_list_url)
        self.assertTrue(any("assigned" in n['message'].lower() for n in citizen_notif.data))

        # 4. Dispatcher notifies the hospital of incoming patient
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {dispatcher_token}')
        notify_hospital_url = reverse('hospital-notify')
        notify_payload = {
            'hospital_id': self.hospital.id,
            'emergency_id': emergency_id,
            'eta_minutes': 8
        }
        notify_response = self.client.post(notify_hospital_url, notify_payload)
        self.assertEqual(notify_response.status_code, status.HTTP_200_OK)
        self.assertEqual(notify_response.data['eta_minutes'], 8)

        # Verify hospital got notified
        hospital_token = self.get_jwt_token('test_hospital', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {hospital_token}')
        hospital_notif = self.client.get(notif_list_url)
        self.assertTrue(any("incoming patient alert" in n['message'].lower() for n in hospital_notif.data))

        # 5. Responder updates the location and status
        responder_token = self.get_jwt_token('test_responder', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {responder_token}')
        
        # Update Location
        loc_url = reverse('responder-location', kwargs={'id': self.responder.id})
        loc_response = self.client.patch(loc_url, {'lat': 40.7135, 'lng': -74.0065})
        self.assertEqual(loc_response.status_code, status.HTTP_200_OK)
        self.assertEqual(loc_response.data['lat'], 40.7135)

        # Update Status
        status_url = reverse('emergency-status', kwargs={'id': emergency_id})
        status_response = self.client.patch(status_url, {'status': 'arrived_at_scene', 'note': 'Arrived at the scene.'})
        self.assertEqual(status_response.status_code, status.HTTP_200_OK)
        self.assertEqual(status_response.data['status'], 'arrived_at_scene')
