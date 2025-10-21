# KSeF App Example

Przykładowa integracja [KsEF PHP Client](https://github.com/N1ebieski/ksef-php-client) na backendzie z aplikacją na frontendzie przy użyciu autoryzacji za pomocą certyfikatów KsEF.

## Technikalia

- backend - napisany w PHP 8.2 przy użyciu frameworku Laravel 12
- frontend - napisany w Typescript przy użyciu VueJS 3

## Instalacja

1. Sklonuj repozytorium

```bash 
git clone https://github.com/N1ebieski/ksef-app-example.test.git

```

2. Uruchom instalację

```bash
composer setup
```

3. Zbuduj aplikację

```bash
npm run build
```

4. Uruchom serwer PHP

```bash
php artisan serve
```

5. Aplikacja powinna być dostępna z poziomu `http://localhost`

## Problem

Autoryzacja do KsEF może odbywać się na kilka sposobów:

- **klasyczne tokeny KsEF** - rozwiązanie tymczasowe, wspierane do końca 2026 roku
- **certyfikaty** z podpisem kwalifikowanym lub pieczęcią
- **certyfikaty KsEF** - wystawiane bezpośrednio przez KsEF na bazie wygenerowanego klucza prywatnego na urządzeniu klienckim
- **ePUAP** - wyłącznie tryb manualny, wymagający każdorazowo interakcji ze strony użytkownika

Jedynym sensownym sposobem autoryzacji do KsEF z punktu widzenia automatyzacji są certyfikaty. Problem z nimi polega na tym, że klucz prywatny ze względów bezpieczeństwa nie może opuścić urządzenia klienckiego. O ile w przypadku aplikacji instalowanych bezpośrednio na urządzeniu klienckim nie stanowi to problemu, to w przypadku **aplikacji webowych** (zarządzanych z poziomu przeglądarki), zwłaszcza w modelu SaaS już tak.

## Zasada działania

https://github.com/user-attachments/assets/49c148ec-2c2b-4076-b9d3-5ee64b5f43c1

1. Użytkownik dodaje swój certyfikat KsEF w panelu `http://localhost/settings/ksef`

- identyfikator NIP oraz zaszyfrowany certyfikat (publiczna część) zostają zapisane w bazie danych na serwerze
- klucz prywatny zostaje zaszyfrowany przez Web Crypto API oraz zapisany w IndexedDB przeglądarki

2. Aplikacja frontendowa wysyła na backend prośbę o wygenerowanie dokumentu `AuthTokenRequest` oraz przekazanie certyfikatu użytkownika (publicznej części)
3. Dokument zostaje podpisany w oparciu o klucz prywatny i odesłany na backend
4. Backend wysyła dokument autoryzacyjny do KsEF, finalnie otrzymuje z KsEF zestaw `Access Token` oraz `Refresh Token`
5. Oba tokeny zostają zapisane do sesji użytkownika, w momencie wylogowania użytkownika z systemu, backend wysyła do ksEF żądanie unieważnienia sesji
6. W momencie ponownego zalogowania użytkownika do systemu, cały proces opisany w punktach 2-5 przebiega automatycznie w tle bez konieczności interakcji ze strony użytkownika

## Ważne pliki

- [signDocumentHandler.ts](https://github.com/N1ebieski/ksef-app-example.test/blob/main/resources/js/actions/signDocumentHandler.ts) - klasa odpowiedzialna za podpisywanie dokumentow w oparciu o klucz prywatny
- [Ksef.vue](https://github.com/N1ebieski/ksef-app-example.test/blob/main/resources/js/pages/settings/Ksef.vue) - komponent odpowiedzialny za dodawanie certyfikatu i klucza prywatnego
- [AuthKsef.vue](https://github.com/N1ebieski/ksef-app-example.test/blob/main/resources/js/components/AuthKsef.vue) - komponent odpowiedzialny za autoryzację aplikacji do KsEF
- [Settings\Ksef controllers](https://github.com/N1ebieski/ksef-app-example.test/tree/main/app/Http/Controllers/Settings/Ksef) - kontrolery odpowiedzialne za zapis certyfikatu do bazy
- [Ksef\Auth controllers](https://github.com/N1ebieski/ksef-app-example.test/tree/main/app/Http/Controllers/Ksef/Auth) - kontrolery odpowiedzialne za autoryzacje do KsEF
- [RevokeKsefSessionListener](https://github.com/N1ebieski/ksef-app-example.test/blob/main/app/Listeners/RevokeKsefSessionListener.php) - listener odpowiedzialny za unieważnienie sesji w KsEF w momencie wylogowania użytkownika z systemu
