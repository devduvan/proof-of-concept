# Thumbnail generator API

Api for generate thumbnails from an image.

Thumbnails generated:

- 400x300
- 160x120
- 120x120

**Testing URL:** https://k4xy6grwpb.execute-api.us-east-1.amazonaws.com
**Documentation:** https://app.swaggerhub.com/apis-docs/devduvan/generate-thumbnails_api/1

# Table of contents

- [Installation](#installation)
    - [Before starting](#before-starting)
    - [Pre-requisites](#pre-requisites)
    - [Pre-requisites for run in local environment](#pre-requisites-for-run-in-local-environment)
- [Infra](#infra)
    - [Configuration](#configuration)
    - [Tests](#tests)
    - [Bootstrap environments](#bootstrap-environments)
    - [Deploy environments](#deploy-environments)
- [Backend](#backend)
    - [Configuration](#configuration)
    - [Local Tests](#local-tests)
    - [Deploy environments](#deploy-environments)
    - [Integrations Tests in test environment](#integrations-tests-in-test-environment)

## Installation

##### Before starting
- I recommend you use AWS organizations for create one organization of test for deploy all resources associated to this project.
- Configure a aws profile called "sinpasis-test" with the credentials of the aws account created before. It's important that this credentials has AdministratorAccess for avoid problems of permissions.
- The project is divided in 2 "sub-projects":
    - infra: A project built with CDK that contains all infraestructure resources. 
    - backend: A project built with Serverless Framework that contains all business logic application.
- Keep in mind that in order to deploy the backend, you must deploy infra first.
- If you going to use the local environment, you should have a default profile configurated. If you don't have this profile configurated, you can do it with this command.
```sh
$ aws configure
AWS Access Key ID [None]: test
AWS Secret Access Key [None]: test
Default region name [us-east-1]: us-east-1
Default output format [None]:
```
_Not is necessary that the credentials are right. You can use fake credentials like the example_

##### Pre-requisites

- Nodejs >= v16.13.1 https://nodejs.org/es/
- CDK >= 2.3.0

```sh
npm install -g aws-cdk
```

- Serverless Framework >= 2.70.0

```sh
npm install -g serverless
```

##### Pre-requisites for run in local environment
- Docker
- localstack https://github.com/localstack/localstack
- cdklocal >= 2.3.0
```sh
npm install -g aws-cdk-local
```

## Infra

#### Configuration

1. Go to the infra project
```sh
cd infra
```
2. Install dependencies
```sh
npm i
```
3. Configure your .env files from .env.example: 
    - .env.dev for local environment
    - .env.test for test environment

#### Notes
- If you copy the .env.example file, don't forget remove the comments.
- If you're going to use an aws account for dev, you should configure the AWS_ACCOUNT_ID and AWS_REGION_ID vars, but if you're going to use localstack it's not necessary.

#### Tests
Execute tests of infrastructure
```sh
npm run test
```

#### Bootstrap environments
Execute this command for configure an specific environment. **(only is necessary one time for environment)**
```sh
npm run config --env=test
```
_For bootstrap the local environment is not necessary pass the flag --env_


#### Deploy environments
Execute this command for deploy to an specific environment.
```sh
npm run deploy --env=test
```
- _For deploy the local environment is not necessary pass the flag --env_
- _Cuando despleguemos en nuestro entorno local, es posible que el stack de api falle, debido a que es un servicio pago de aws por ser HTTP API v2, sin embargo la API no la vamos a usar en local debido a que vamos a usar sls offline, asi que podemos ignorar el despliegue de ese stack_
- _For your first deploy, make sure that you already bootstrap the environment_


## Backend
#### Configuration

1. Go to the backend project
```sh
cd backend
```
2. Install dependencies
```sh
npm run installAll
```
3. Configure your .env file from .env.example
4. Start service
    4.1 Automatic form:
    ```sh
    npm run start
    ```
    4.2 Manual form: If you have problems with  serverless-offline-multi for start service of automatic form, you can use this form:
    - Open a new terminal
    - Go to /backend/images folder
    - Run the next command
    ```sh
        npm run start
    ```
    - Open a new terminal
    - Go to /backend/thumbnails folder
    - Run the next command
    ```sh
       npm run start
    ```


#### Notes
- If you copy the .env.example file, don't forget remove the comments.
- By Default the images service run on port 3001 and the thumbnails service run on 3002, you can change this on main.sh, but remember update the envs in /tests/.env

#### Local Tests
Execute tests of infrastructure. From /backend, execute the next command for run the tests locally
```sh
npm run test
```
_For execute tests it's necessary that the services are started_


#### Deploy environments
Execute this command for deploy to an specific environment.
```sh
npm run deploy --env=test
```
- _For deploy the local environment is not necessary pass the flag --env_
- _Cuando despleguemos en nuestro entorno local, es posible que el stack de api falle, debido a que es un servicio pago de aws por ser HTTP API v2, sin embargo la API no la vamos a usar en local debido a que vamos a usar sls offline, asi que podemos ignorar el despliegue de ese stack_


#### Integrations Tests in test environment
Execute integration tests directly on the api of the test environment
```sh
npm run testApi
```
_testApi always is executed after deploy_

