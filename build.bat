@echo off
set "sass_dir=scss"
set "output_dir=styles"

for %%f in ("%sass_dir%\*.scss") do (
    echo Compiling %%f
    sass "%%f" "%output_dir%\%%~nf.css"
)