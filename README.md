This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

To see the deployed app, visit this website: [https://campfire.howard-zhu.com/](https://campfire.howard-zhu.com/)

To run locally, you will need to change SOCKET_SERVER_URL on line 14 of src/app/page.tsx. 
Otherwise, it will attempt to connect to the deployment server but be rejected due to mismatching domains.

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