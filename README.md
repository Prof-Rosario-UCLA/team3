This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

To see the deployed app, visit this website: [https://campfire.howard-zhu.com/](https://campfire.howard-zhu.com/)

To run locally, you will need to change SOCKET_SERVER_URL on line 14 of src/app/page.tsx. 
Otherwise, it will attempt to connect to the deployment server but be rejected due to mismatching domains.

You will also need to configure a `.env` file in the root directory

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-sdk.json"
```

Along with a `firebase-admin-sdk.json` file in the root directory

```
{
  "type": ...,
  "project_id": ...,
  "private_key_id": ...,
  "private_key": ...,
  "client_email": ...,
  "client_id": ...,
  "auth_uri": ...,
  "token_uri": ...,
  "auth_provider_x509_cert_url": ...,
  "client_x509_cert_url": ...,
  "universe_domain": ..."
}

```
Both of these files should be provided by the firebase admin console. 

Afterward, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## CI/CD
The CI/CD pipeline operates in several stages

1. Connecting/Auth to GKE
    - We authenticate with Google Cloud with a created service account
    - The email and key are stored as GitHub secrets

2. Build Docker Container
    - We build the container with a tag based on the project ID and commit hash that triggered the build.
    - We also pass in necessary secret information about our backend services during this build process.
    - We then push the project onto our Google Cloud artifact registry.

3. Deploy to the cluster
    - Using kustomize and several yaml files we apply them to our GKE cluster using `kubectl apply -f`
    - We then rollout the change to the entire cluster

## GKE
Our GKE cluster configuration can mostly be described in the yaml files under the `docker` folder

`deployment.yaml`
- Here we specify the number of replicas, the image tag, port exposure, and secret importing

`ingress.yaml`
- Here we use our HTTPS certificate, configure our static IP and set routes.

`managed-cert.yaml`
- Specifies an HTTPS certificate for us to use

`service.yaml`
- Maps the HTTP port to the container port 3000

## docker
```dockerfile
docker build -f docker/Dockerfile -t campfire:latest .
```
