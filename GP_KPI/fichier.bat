@echo off
echo Creation de l'arborescence du projet...

:: Fichiers racine
type nul > index.html
type nul > dashboard.html
type nul > cours.html
type nul > module-efficience.html
type nul > module-qualite.html
type nul > module-experience.html
type nul > module-strategique.html
type nul > module-conformite.html
type nul > tableau-bord.html
type nul > env.js
echo # Guide Storage > GUIDE-STORAGE.md

:: Dossier Assets
mkdir assets\icons
mkdir assets\images
type nul > assets\icons\icon.svg
type nul > assets\images\logo.svg

:: Dossier Core
mkdir core\config
mkdir core\services
mkdir core\theme
mkdir core\utils
type nul > core\config\constants.js
type nul > core\config\supabase.js
type nul > core\services\authService.js
type nul > core\services\storageService.js
echo // Theme JS > core\theme\theme.js
type nul > core\utils\messages.js

:: Dossier CSS
mkdir css\animations
mkdir css\base
mkdir css\components
mkdir css\layout
mkdir css\modules
type nul > css\main.css
type nul > css\animations\animations.css
type nul > css\base\reset.css
type nul > css\base\typography.css
type nul > css\base\variables.css
type nul > css\components\buttons.css
type nul > css\components\cards.css
type nul > css\components\forms.css
type nul > css\layout\layout.css
type nul > css\modules\login.css
type nul > css\modules\dashboard.css
type nul > css\modules\course.css

:: Dossier Pages
mkdir pages\auth

echo.
echo Structure creee avec succes !
pause