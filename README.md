# KSeF App Example

An example integration of [KsEF PHP Client](https://github.com/N1ebieski/ksef-php-client) on the backend with a frontend application using certificate-based authentication for KsEF.

## Technical Details

- backend - written in PHP 8.2 using the Laravel 12 framework  
- frontend - written in TypeScript using VueJS 3

## Installation

1. Clone the repository

```bash
git clone https://github.com/N1ebieski/ksef-app-example.test.git
```

2. Run the installation

```bash
composer setup
```

3. Build the application

```bash
npm run build
```

4. Start the PHP server

```bash
php artisan serve
```

5. The application should be accessible at `http://localhost`

## Problem

Authorization for KsEF can be done in several ways:

- **classic KsEF tokens** – a temporary solution, supported until the end of 2026
- **certificates** with a qualified signature or seal
- **KsEF certificates** – issued directly by KsEF based on a private key generated on the client device
- **ePUAP** – manual mode only, requiring user interaction each time

From the perspective of automation, the only reasonable method of authentication to KsEF is through certificates. The problem is that, for security reasons, the private key cannot leave the client device. While this is not an issue for applications installed directly on the client's device, it becomes problematic for web applications (managed via the browser), especially in a SaaS model.

## How It Works

https://github.com/user-attachments/assets/49c148ec-2c2b-4076-b9d3-5ee64b5f43c1

1. The user adds their KsEF certificate in the panel at `http://localhost/settings/ksef`

- the NIP identifier and the encrypted certificate (public part) are stored in the server database
- the private key is encrypted via the Web Crypto API and stored as non-exportable in the browser's IndexedDB

2. The frontend application sends a request to the backend to generate an `AuthTokenRequest` document and passes the user’s certificate (public part)
3. The document is signed using the private key and sent back to the backend
4. The backend sends the authorization document to KsEF and receives from KsEF an `Access Token` and a `Refresh Token`
5. Both tokens are stored in the user session; when the user logs out, the backend sends a request to KsEF to revoke the session
6. When the user logs back into the system, the entire process described in steps 2–5 runs automatically in the background without user interaction

## Important Files

- [signDocumentHandler.ts](https://github.com/N1ebieski/ksef-app-example.test/blob/main/resources/js/actions/signDocumentHandler.ts) - class responsible for signing documents using the private key
- [Ksef.vue](https://github.com/N1ebieski/ksef-app-example.test/blob/main/resources/js/pages/settings/Ksef.vue) - component responsible for adding the certificate and private key
- [AuthKsef.vue](https://github.com/N1ebieski/ksef-app-example.test/blob/main/resources/js/components/AuthKsef.vue) - component responsible for authenticating the application with KsEF
- [AppServiceProvider](https://github.com/N1ebieski/ksef-app-example.test/blob/main/app/Providers/AppServiceProvider.php) - a provider that registers the KsEF PHP Client as a singleton
- [Settings\Ksef controllers](https://github.com/N1ebieski/ksef-app-example.test/tree/main/app/Http/Controllers/Settings/Ksef) - controllers responsible for saving the certificate to the database
- [Ksef\Auth controllers](https://github.com/N1ebieski/ksef-app-example.test/tree/main/app/Http/Controllers/Ksef/Auth) - controllers responsible for KsEF authentication
- [RevokeKsefSessionListener](https://github.com/N1ebieski/ksef-app-example.test/blob/main/app/Listeners/RevokeKsefSessionListener.php) - listener responsible for revoking the KsEF session when the user logs out of the system
