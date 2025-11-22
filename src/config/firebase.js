import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// ⚠️ PENTING: Ganti dengan konfigurasi Firebase Anda sendiri
// Dapatkan dari: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    type: "service_account",
    project_id: "rpl-umkm",
    private_key_id: "72110528789f6d20ee65b01762a8494ddaaa6d22",
    private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbAowbxzHUts+9\nKXRSxJfeJclu9mDvDHkO+iiqhvRk+ZpwZmOAIxe35pHTKH1lhNxpBIMf/Y5Xp0Sc\nRg+Y+MnTRFMbRshax2rVlVGdplFSHb863cvonB6X6PGyt+5bFzZElcn6oLHezUDU\nV2zDMomJtChVpzEfapwoLwKcfuOh0GIhvusRy0EXxAb1Xh7Xhd+ycqVzu5OU8Tvz\nnt9DlwTmKK57UfEA5IERDo4HJfVlOmMFEhRvtvWLAv6T0PS6zZAl5h6Nzfp31oPq\nep7MbxYHEdQ9//rYji3J9giSdUxYZ7jiQ6iFZmsKrv4u4Ug9SxvfXSXUqwYjVlMm\nuuyotSSZAgMBAAECggEAEJbRTmYDaBrkLRkU7BNjHjBw4RxS0a35WivoZP5YSHEV\nry+PmDb68XL1bHAJNjre8n96f95WErKjV6OrmR6N3xhc+S3JOFhu8bhf7cKZhKWn\nL1954L05SLAcOrmERFcY77oENMfzoS5H8QL27z7b5y0ueZ/H8JrD3aat78pha1y4\nU1mUWSl2ssuUhA2JtsRreileS1ZsyMfnXRiuhctTj+0IthwECNLABVQ90Av7yZai\nEUpF0NsK+7AVILxx5wL1TRYobAMmi2xeYdWcuRvPJzGJuZ4F47G/c6mI2sufDZxz\nXeyntMjQ/Ps636aG7JPUWAfPpa5KUvZB2ruqoRo6LwKBgQD+cBhHsv9nwnzvfJ6m\n4m6tYJFhgf7gdPd/m7QwDtoGJYyMI0uEqT7FBpVYbsCwXWemXGXPrEQ9ZTn1wFmC\n9ihHGEkXOs3qajdGggIIotZEw2Cf41fC64v3cCvaglOXy2QpiIkiU0c7znnsoH5/\n7nk0bBjli/JCP/clk9rodjfPvwKBgQDcWsUJbDJm+z1zBs+NmdKfSDxdh4Sr8jTY\nHRc3maaJDr3PhAT4yrXS3W5dJJSwFdZHUyle9nmT6qp9L1np5tftgZqluoW+zTC4\nFxpmfgGPF4e6xVVLUmv3I8EPUbHta4uIa7vd6zQxkyjYcMFzpqoLfMgjxm0CXDz0\nMckgaLshpwKBgGFjjJedFw+jLOkJ/TwJfa2VQfBdrq5Bdx57/atLc/5YTwSw2c4M\nbf9CNtXjhpO7HNpbkYi8+l25qka7ekebau1TiV5/3qN0RnYRey/NDFDDq+9nOIde\nW3O5lr+LlO2MJ2mSXlMqJyDoNljxUZosMG51Vc4/E9px22qhvm+uGEzHAoGAS1UI\nyYjgzk4UGu/4Ivu0gtnKMVt0IuiB4mRHnK19vpt4jqoenQOIF5e19EfeQTil8epf\nWWS/+a6fLH70qT9PEJZfTUswECPMBRN45hMr60RrFZIC7+Y0nN/vT5JpVraOlEvo\nhRy00kHyE9Swfh47QgQd1AUxHT51ZDJlBRxo5T8CgYBZcVgRRQEQ7/rN5yp7kdti\nDuRFNFV5eoAxmEB74qSwQXJv6FiV7xOQILgp/fpnC6R0F7vBSnTUMsjksjQKOAUV\nwajKJ3jOmeBNnGLfpx8neWadJgGY+ONnI6Q5x3uKYAWJEyHqhgq/LwgH9cTEjZGY\n5vLWx39ZfI2jfJ9glCpjag==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@rpl-umkm.iam.gserviceaccount.com",
    client_id: "112807930162865341182",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40rpl-umkm.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;

/*
CARA SETUP FIREBASE:

1. Buka https://console.firebase.google.com
2. Buat project baru atau pilih yang sudah ada
3. Klik gear icon > Project Settings
4. Scroll ke "Your apps" > klik icon web (</>)
5. Register app dan copy konfigurasi
6. Paste konfigurasi di atas

SETUP FIRESTORE:
1. Di Firebase Console, klik "Firestore Database"
2. Klik "Create database"
3. Pilih "Start in test mode" untuk development
4. Pilih region terdekat (asia-southeast2 untuk Indonesia)

SETUP STORAGE:
1. Di Firebase Console, klik "Storage"
2. Klik "Get started"
3. Pilih "Start in test mode"

STRUKTUR DATABASE:
- stores/{storeId}
  - name: string
  - whatsappNumber: string
  - createdAt: timestamp
  - updatedAt: timestamp

- stores/{storeId}/items/{itemId}
  - name: string
  - price: number
  - description: string
  - category: string
  - photo: string (URL)
  - views: number
  - order: number
  - createdAt: timestamp
  - updatedAt: timestamp
*/
