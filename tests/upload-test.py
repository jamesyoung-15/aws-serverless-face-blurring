import unittest
import requests
import base64
import time

class TestImageUpload(unittest.TestCase):
    # integration testing for uploading image to API, getting jobID, and getting job status after 10 seconds

    API_URL = "https://1u7bfjqswl.execute-api.us-east-1.amazonaws.com/prod"
    jobId = None

    def setUp(self):
        # image to test
        self.image_path = '../media/messi.jpg'  

    def test_image_upload(self):
        # convert to base64
        with open(self.image_path, 'rb') as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode('utf-8') + "==="

        # body
        payload = {
            'content': encoded_image,
            'confidenceThreshold': 50,
        }
        
        # post request to upload image as base64
        response = requests.post(self.API_URL+"/upload", json=payload)

        # should return 200 with success in body, check for 'successfully' in message
        print(response.json())
        self.assertEqual(response.status_code, 200)  
        self.assertIn('successfully', response.json()['message'])
        # check if jobID exists
        self.assertIn('JobID', response.json())
        self.assertIsNotNone(response.json()['JobID'])

        # check job status after 10 seconds
        time.sleep(10)

        jobResponse = requests.get(self.API_URL + '/jobs/' + response.json()['JobID'])
        print(jobResponse.json())
        self.assertEqual(jobResponse.status_code, 200)
        self.assertIn('COMPLETED', jobResponse.json()['status'])
        self.assertIsNotNone(jobResponse.json()['content'])



        

if __name__ == '__main__':
    unittest.main()