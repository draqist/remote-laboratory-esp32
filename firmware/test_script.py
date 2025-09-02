#!/usr/bin/env python3
"""
Test script for Remote Laboratory ESP32 communication
Tests WebSocket connectivity and measurement functionality
"""

import asyncio
import websockets
import json
import time
import sys

class RemoteLabTester:
    def __init__(self, esp32_ip):
        self.esp32_ip = esp32_ip
        self.websocket_url = f"ws://{esp32_ip}:81"
        self.websocket = None
        
    async def connect(self):
        """Connect to ESP32 WebSocket server"""
        try:
            print(f"Connecting to {self.websocket_url}...")
            self.websocket = await websockets.connect(self.websocket_url)
            print("✓ Connected successfully")
            return True
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from WebSocket server"""
        if self.websocket:
            await self.websocket.close()
            print("✓ Disconnected")
    
    async def send_command(self, command):
        """Send command to ESP32 and wait for response"""
        if not self.websocket:
            print("✗ Not connected")
            return None
            
        try:
            message = json.dumps({"command": command})
            print(f"→ Sending: {message}")
            
            await self.websocket.send(message)
            response = await asyncio.wait_for(self.websocket.recv(), timeout=10.0)
            
            print(f"← Received: {response}")
            return json.loads(response)
            
        except asyncio.TimeoutError:
            print("✗ Timeout waiting for response")
            return None
        except Exception as e:
            print(f"✗ Error: {e}")
            return None
    
    async def test_ping(self):
        """Test ping command"""
        print("\n=== Testing Ping Command ===")
        response = await self.send_command("ping")
        
        if response and response.get("type") == "pong":
            print("✓ Ping test passed")
            return True
        else:
            print("✗ Ping test failed")
            return False
    
    async def test_resistor_measurement(self):
        """Test resistor measurement command"""
        print("\n=== Testing Resistor Measurement ===")
        response = await self.send_command("measure_resistor")
        
        if response and response.get("type") == "resistance_measurement":
            resistance = response.get("resistance", 0)
            samples = response.get("samples", 0)
            quality = response.get("quality", "unknown")
            
            print(f"✓ Measurement successful:")
            print(f"  Resistance: {resistance:.2f} Ω")
            print(f"  Valid samples: {samples}")
            print(f"  Quality: {quality}")
            
            return True
        else:
            print("✗ Measurement test failed")
            return False
    
    async def test_invalid_command(self):
        """Test error handling with invalid command"""
        print("\n=== Testing Invalid Command ===")
        response = await self.send_command("invalid_command")
        
        if response and response.get("type") == "error":
            print("✓ Error handling test passed")
            return True
        else:
            print("✗ Error handling test failed")
            return False
    
    async def run_all_tests(self):
        """Run complete test suite"""
        print("Remote Laboratory Test Suite")
        print("=" * 40)
        
        if not await self.connect():
            return False
        
        tests = [
            self.test_ping,
            self.test_resistor_measurement,
            self.test_invalid_command
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if await test():
                passed += 1
            time.sleep(1)  # Small delay between tests
        
        await self.disconnect()
        
        print(f"\n=== Test Results ===")
        print(f"Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        return passed == total

async def main():
    if len(sys.argv) != 2:
        print("Usage: python test_script.py <ESP32_IP_ADDRESS>")
        print("Example: python test_script.py 192.168.1.100")
        sys.exit(1)
    
    esp32_ip = sys.argv[1]
    tester = RemoteLabTester(esp32_ip)
    
    success = await tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
