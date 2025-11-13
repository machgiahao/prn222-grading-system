# Start from the official Ollama image
FROM ollama/ollama:latest

RUN \
    # 1. Start the Ollama server in the background
    /bin/ollama serve & \
    
    # 2. Wait 5 seconds for the server to start up
    sleep 5 && \
    
    # 3. Pull the model (the client can now find the running server)
    /bin/ollama pull nomic-embed-text && \
    
    # 4. Stop the background server
    pkill ollama

CMD ["serve"]
