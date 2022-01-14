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
- If you're going to use an aws account for dev, you should configure the AWS_ACCOUNT_ID and AWS_REGION_ID vars in .env.dev, but if you're going to use localstack it's not necessary.

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

_For bootstrap the local environment is not necessary pass the argument --env_

#### Deploy environments

Execute this command for deploy to an specific environment.

```sh
npm run deploy --env=test
```

- _For deploy the local environment is not necessary pass the argument --env_
- _When we deploy our local environment, it's possible that the shared stack fail, because we are using API Gateway HTTP v2 that is a paid service of localstack. So we can ignore this error but don't worry, the other resources are created with success and for simulate the API in local environment we going to use sls offline._
- _For your first deploy, make sure that you already bootstrap the environment_

#### Destroy environments

For destroy all infrastructure resources in a specific enviroment, you can use the next command.

```sh
npm run destroy --env=test
```

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
   - **Automatic method**:
   ```sh
   npm run start
   ```
   - **Manual method**: If you have problems with serverless-offline-multi for start service of automatic method, you can use this method:
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
- By Default the images service run on port 3001 and the thumbnails service run on 3002, you can change this on main.sh, but remember update the envs in your.env file

#### Local Tests

Execute tests of backend.

In /backend, execute the next command for run the tests locally

```sh
npm run test
```

_For execute tests it's necessary that the services are started and infra is deployed on local_

#### Deploy environments

Execute this command for deploy to an specific environment.

```sh
npm run deploy --env=test
```

#### Integrations Tests in test environment

Execute integration tests directly on the api of the test environment

```sh
npm run testApi
```

_testApi always is executed after deploy_

#### Destroy environments

For destroy all resources of backend in a specific enviroment, you can use the next command.

```sh
npm run destroy --env=test
```
