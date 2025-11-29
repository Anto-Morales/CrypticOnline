# 🔐 CrypticOnline

**Plataforma de aprendizaje sobre criptografía y seguridad informática.**

## 📋 Descripción

CrypticOnline es una aplicación web completa que permite a usuarios aprender conceptos de criptografía, resolver desafíos de seguridad y practicar técnicas de encriptación en un entorno interactivo.

## 🎯 Características principales

- ✅ Autenticación y gestión de usuarios
- ✅ Desafíos criptográficos interactivos
- ✅ Sistema de puntuación y ranking
- ✅ Panel de administración
- ✅ API RESTful robusta
- ✅ Interfaz responsive

## 🚀 Inicio rápido

### Requisitos previos
- Node.js v16+
- npm o yarn
- Base de datos (MongoDB/PostgreSQL)

### Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd CrypticOnline1

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

## 📁 Estructura del proyecto

```
CrypticOnline1/
├── backend/              # Servidor Node.js/Express
│   ├── routes/          # Rutas API
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Esquemas de BD
│   ├── middleware/      # Middlewares custom
│   └── config/          # Configuración
├── frontend/            # Aplicación React/Vue
│   ├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Vistas principales
│   └── services/        # Servicios API
├── docs/                # Documentación
└── package.json         # Dependencias del proyecto
```

## 📚 Documentación

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Diseño de la aplicación
- **[BACKEND.md](./docs/BACKEND.md)** - Guía del backend
- **[FRONTEND.md](./docs/FRONTEND.md)** - Guía del frontend
- **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Endpoints disponibles
- **[SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)** - Configuración detallada
- **[conf.js](./conf.js)** - Configuración centralizada

## 🔧 Variables de entorno

Ver `.env.example` o `SETUP_GUIDE.md` para lista completa.

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT.

## ❓ Soporte

Para preguntas o problemas, abre un issue en el repositorio.
