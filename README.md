# Titan Builder 🏋️

Plataforma avanzada para la gestión de fuerza y acondicionamiento físico con análisis inteligente mediante IA.

## 🚀 Características

- **Registro de Entrenamientos**: Fuerza, Cardio, Natación, Clases Colectivas
- **Dashboard Inteligente**: Métricas de composición corporal y gráficos de progreso
- **Misiones (Planes de Entrenamiento)**: Generación automática con IA
- **Analista IA**: Análisis profundo del progreso usando Google Gemini
- **Historial Completo**: Seguimiento detallado de todas las sesiones
- **Tema Personalizable**: Modo oscuro y claro

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase (gratuita)
- API Keys de IA (opcional, para funciones de IA):
  - Google Gemini API Key
  - OpenAI API Key (opcional, para funciones avanzadas)

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

#### Variables del Cliente (Frontend)
Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

#### Variables del Servidor (Backend - Vercel)
**IMPORTANTE**: Las API keys de IA deben configurarse en Vercel como variables de entorno del servidor (NO con prefijo VITE_):

En Vercel Dashboard → Settings → Environment Variables, agrega:

```env
# API Keys del Servidor (NO usar prefijo VITE_)
GEMINI_API_KEY=tu_gemini_api_key_aqui
OPENAI_API_KEY=tu_openai_api_key_aqui
```

**Seguridad**: Las API keys están en el servidor, no se exponen al cliente. Esto es más seguro que usar `VITE_*` variables.

#### Desarrollo Local (Opcional)
Si quieres probar las funciones de IA localmente sin `vercel dev`, crea un archivo `.env.local`:

```env
# Solo para desarrollo local - NO subir a git
GEMINI_API_KEY=tu_gemini_api_key_aqui
OPENAI_API_KEY=tu_openai_api_key_aqui
```

**Nota**: Este archivo debe estar en `.gitignore` y solo usarlo si no puedes usar `vercel dev`.

### 3. Configurar Base de Datos en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta el script SQL que aparece en la aplicación cuando faltan tablas
4. O copia el script desde `App.tsx` (línea 154-220)

El script crea las siguientes tablas:
- `profiles`: Perfiles de usuario
- `workouts`: Entrenamientos registrados
- `weight_history`: Historial de peso y composición corporal
- `training_plans`: Planes de entrenamiento (misiones)

### 4. Ejecutar la Aplicación

#### Opción A: Desarrollo con Vercel (Recomendado - API keys seguras)
```bash
# 1. Instala Vercel CLI (solo la primera vez)
npm i -g vercel

# 2. Inicia sesión en Vercel (solo la primera vez)
vercel login

# 3. Vincula tu proyecto (solo la primera vez, desde la raíz del proyecto)
vercel link

# 4. Ejecuta con Vercel (carga variables de entorno automáticamente)
npm run dev:vercel
# O directamente:
vercel dev
```

**Ventajas**:
- ✅ Carga automáticamente las variables de entorno de Vercel
- ✅ Las API keys están seguras (no en el cliente)
- ✅ Simula el entorno de producción localmente

#### Opción B: Desarrollo solo Frontend
```bash
npm run dev
```
**Nota**: Con esta opción, las funciones de IA no funcionarán localmente a menos que configures un `.env.local` (ver abajo).

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vercel asigne)

## 🏗️ Construcción para Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 🔒 Seguridad

**IMPORTANTE**: 
- ✅ **API Keys protegidas**: Las API keys de IA están en el servidor (Vercel Serverless Functions), no se exponen al cliente
- ✅ Nunca subas tu archivo `.env` al repositorio
- ✅ Las credenciales de Supabase están en el código por compatibilidad, pero se recomienda usar variables de entorno
- ✅ Las API Keys de IA deben configurarse en Vercel como variables de entorno del servidor (sin prefijo `VITE_`)

## 📝 Mejoras Implementadas

### Seguridad
- ✅ Variables de entorno para credenciales
- ✅ Validación de API keys

### UX/UI
- ✅ Sistema de notificaciones (Toast) reemplazando `alert()`
- ✅ Mejor manejo de errores con mensajes descriptivos
- ✅ Feedback visual mejorado en operaciones

### Funcionalidades
- ✅ Validación mejorada en formularios
- ✅ Mensajes de éxito/error más informativos

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth) + Vercel Serverless Functions
- **IA**: Google Gemini API + OpenAI API (con fallback automático)
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 📦 Estructura del Proyecto

```
titantrack/
├── api/             # Vercel Serverless Functions (API keys seguras)
│   ├── analyze-workouts.ts
│   └── generate-plan.ts
├── components/      # Componentes React
├── services/        # Servicios del cliente
├── hooks/          # Custom hooks
├── types.ts        # Definiciones TypeScript
└── App.tsx         # Componente principal
```

## 🐛 Solución de Problemas

### Error: "TABLE_MISSING"
- Ejecuta el script SQL en Supabase (ver paso 3 de configuración)

### Error: "API Key de Gemini no configurada"
- Configura `GEMINI_API_KEY` en Vercel (Settings → Environment Variables)
- **NO uses prefijo VITE_** para las API keys del servidor
- Obtén tu API key en [Google AI Studio](https://makersuite.google.com/app/apikey)

### Error: "API Key de OpenAI no configurada"
- Configura `OPENAI_API_KEY` en Vercel (Settings → Environment Variables)
- Obtén tu API key en [OpenAI Platform](https://platform.openai.com/api-keys)

### Error de autenticación
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctamente configuradas
- Asegúrate de que las políticas RLS estén activas en Supabase

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
