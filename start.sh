#!/bin/bash
echo "Starting Invoice App..."

# Function to check if the app is running
check_app() {
    curl -s http://localhost:5173 > /dev/null
    return $?
}

# Create a separate script for the main process
cat > run_app.sh << 'EOL'
#!/bin/bash
cd "$(dirname "$0")"
npm install
npm start
EOL

# Make the run script executable
chmod +x run_app.sh

# Run the app in the background
./run_app.sh > /dev/null 2>&1 &

# Wait for the app to start
echo "Starting Invoice App..."
until check_app; do
    sleep 1
done

# Open in default browser
open http://localhost:5173

# Use AppleScript to minimize or hide the Terminal window
osascript -e 'tell application "Terminal" to set miniaturized of window 1 to true'
# Alternative: Hide the Terminal completely
# osascript -e 'tell application "Terminal" to set visible of window 1 to false'