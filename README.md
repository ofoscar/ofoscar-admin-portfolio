# OfoscarAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## GitHub Actions deployment

The `.github/workflows/deploy.yml` workflow builds the production site and runs the unit tests for pull requests and pushes to `main`. A successful push to `main` uploads `dist/ofoscar-angular/browser/` to S3, then uses AWS Systems Manager (SSM) to have the EC2 instance sync those files into `/home/ubuntu/ofoscar-angular/dist/`. GitHub authenticates to AWS with OIDC; no SSH key is stored in GitHub.

Configure these repository variables in **Settings → Secrets and variables → Actions → Variables**:

- `AWS_REGION`: AWS region, such as `us-east-2`.
- `S3_DEPLOY_BUCKET`: private bucket used to stage versioned Angular build files.

Configure these repository secrets in **Settings → Secrets and variables → Actions → Secrets**:

- `AWS_DEPLOY_ROLE_ARN`: IAM role ARN that trusts this GitHub repository through OIDC. Scope its S3 upload permissions to the staging prefix and its SSM permissions to the target instance and `AWS-RunShellScript` document. The workflow uses `SendCommand` and `GetCommandInvocation`.
- `EC2_INSTANCE_ID`: ID of the target EC2 instance.

The EC2 instance must be managed by Systems Manager (SSM Agent online and an instance profile with `AmazonSSMManagedInstanceCore` or equivalent). Its instance profile also needs `s3:GetObject` for the staging prefix, and the instance needs network access to S3 and SSM endpoints. The instance must have AWS CLI installed and the SSM command must be able to write to `/home/ubuntu/ofoscar-angular/dist/`. Keep the S3 bucket private; lifecycle rules can remove old `angular/` build prefixes after a retention period.
