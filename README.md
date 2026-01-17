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
- API Key de Google Gemini (opcional, para funciones de IA)

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Google Gemini API (Opcional - solo para funciones de IA)
VITE_GEMINI_API_KEY=tu_gemini_api_key_aqui
```

**Nota**: Si no configuras las variables de entorno, la aplicación usará valores por defecto (no recomendado para producción).

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

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Construcción para Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 🔒 Seguridad

**IMPORTANTE**: 
- Nunca subas tu archivo `.env` al repositorio
- Las credenciales de Supabase están en el código por compatibilidad, pero se recomienda usar variables de entorno
- La API Key de Gemini debe mantenerse privada

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
- **Backend**: Supabase (PostgreSQL + Auth)
- **IA**: Google Gemini API
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 📦 Estructura del Proyecto

```
titantrack/
├── components/       # Componentes React
├── services/         # Servicios (Supabase, Gemini)
├── hooks/           # Custom hooks
├── types.ts         # Definiciones TypeScript
└── App.tsx          # Componente principal
```

## 🐛 Solución de Problemas

### Error: "TABLE_MISSING"
- Ejecuta el script SQL en Supabase (ver paso 3 de configuración)

### Error: "API Key de Gemini no configurada"
- Configura `VITE_GEMINI_API_KEY` en tu archivo `.env`
- Obtén tu API key en [Google AI Studio](https://makersuite.google.com/app/apikey)

### Error de autenticación
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctamente configuradas
- Asegúrate de que las políticas RLS estén activas en Supabase

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
