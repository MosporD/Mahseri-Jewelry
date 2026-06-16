@echo off
cd /d "%~dp0.."
node scripts\telegram-post-products.js --loop
