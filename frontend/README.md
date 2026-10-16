# Skill Connect frontend (structured version)

This version is based on the previously working `skill_connect_frontend_fixed.zip`. It keeps the same API calls, booking/payment/review flows, assessment flow, English/Tamil labels, and Vite setup. The customer home screen does not show the main navigation links; the small utility controls remain available.

## Folder structure

- `src/App.jsx` — app state, routing between screens, and API workflow orchestration
- `src/pages/santhosh/` — customer home, navigation, notifications, profile
- `src/pages/gokul/` — login/register, service catalogue, recommendations/booking, worker dashboard, assessment/result, orders/payment/reviews
- `src/components/` — reusable form field and error boundary
- `src/data/` — English/Tamil copy and service labels
- `src/utils/` — API helper and service translation helpers

## Run on Windows

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Default main backend URL: `http://127.0.0.1:8001`. Set `VITE_API_URL` in `.env` if yours differs. The AI module is expected to be reached through the existing main backend proxy. MongoDB and the backend services must be running.

## Important

This ZIP contains the frontend only. It does not modify the backend or AI module. The payment screen records a payment already made; it does not process a live payment transaction.
