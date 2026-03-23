# Ordframe Demo

Ordframe lets you run on-chain inscriptions off-chain.

It loads inscription code into an iframe that runs inside `ordinals.com`, then posts your HTML into that viewer so you can test how the inscription behaves.

This is a simple way to battle test an inscription before you fully rely on it.

## Demo

Use [demo.html](demo.html) to test your own HTML.

1. Open [demo.html](demo.html)
2. Replace the HTML inside the `payload` template with your own full HTML
3. Load the file
4. The page posts your HTML into the ordinals iframe automatically

## VS Code Extension

This folder also includes a VS Code extension that lets you right-click an HTML file and open it with Ordview.
