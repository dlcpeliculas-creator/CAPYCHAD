; CAPYCHAD · personalización del instalador NSIS (electron-builder la incluye vía nsis.include)
; Pantalla final: además de "Ejecutar CAPYCHAD", ofrecemos descargar NVDA — el lector de
; pantalla gratuito de NV Access. Primera medida del estándar docs/lanzador.md (punto 11):
; ningún instalador del género lo hace. El checkbox viene desmarcado (respeto por defecto);
; al marcarlo se abre la página oficial de descarga en el navegador.

!macro customFinishPage
  !define MUI_FINISHPAGE_SHOWREADME "https://www.nvaccess.org/download/"
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Descargar NVDA — lector de pantalla gratuito (recomendado para personas ciegas)"
  !define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!macroend
