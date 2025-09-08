#!/usr/bin/env python3
"""
Multi-Experiment Remote Laboratory Test Script
Tests all experiments: Resistor, LED PWM, Temperature, Light, Logic Gates
"""

import asyncio
import websockets
import json
import time
import sys

class RemoteLabTester:
    def __init__(self, host='192.168.1.100', port=81):
        self.host = host
        self.port = port
        self.websocket = None
        self.test_results = {}
        
    async def connect(self):
        """Connect to the ESP32 WebSocket server"""
        try:
            uri = f"ws://{self.host}:{self.port}"
            print(f"Connecting to {uri}...")
            self.websocket = await websockets.connect(uri)
            print("✓ Connected successfully!")
            return True
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from the WebSocket server"""
        if self.websocket:
            await self.websocket.close()
            print("✓ Disconnected")
    
    async def send_command(self, command, **params):
        """Send a command and wait for response"""
        if not self.websocket:
            print("✗ Not connected")
            return None
        
        message = {"command": command, **params}
        print(f"→ Sending: {json.dumps(message)}")
        
        try:
            await self.websocket.send(json.dumps(message))
            response = await asyncio.wait_for(self.websocket.recv(), timeout=10.0)
            data = json.loads(response)
            print(f"← Received: {json.dumps(data, indent=2)}")
            return data
        except asyncio.TimeoutError:
            print("✗ Timeout waiting for response")
            return None
        except Exception as e:
            print(f"✗ Error: {e}")
            return None
    
    async def test_ping(self):
        """Test basic connectivity with ping"""
        print("\n=== Testing Ping ===")
        response = await self.send_command("ping")
        
        if response and response.get("type") == "pong":
            print("✓ Ping test passed")
            self.test_results["ping"] = "PASS"
            return True
        else:
            print("✗ Ping test failed")
            self.test_results["ping"] = "FAIL"
            return False
    
    async def test_resistor_measurement(self):
        """Test resistor measurement functionality"""
        print("\n=== Testing Resistor Measurement ===")
        response = await self.send_command("measure_resistor")
        
        if response and response.get("type") == "resistance_measurement":
            resistance = response.get("resistance", 0)
            uncertainty = response.get("uncertainty", 0)
            quality = response.get("quality", "unknown")
            
            print(f"✓ Resistance: {resistance:.2f} ± {uncertainty:.2f} Ω")
            print(f"✓ Quality: {quality}")
            print(f"✓ Samples: {response.get('samples', 0)}/{response.get('total_samples', 0)}")
            
            if resistance > 0 and quality in ["good", "fair"]:
                self.test_results["resistor"] = "PASS"
                return True
            else:
                print("✗ Invalid measurement or poor quality")
                self.test_results["resistor"] = "FAIL"
                return False
        else:
            print("✗ Resistor measurement failed")
            self.test_results["resistor"] = "FAIL"
            return False
    
    async def test_led_pwm(self):
        """Test LED PWM brightness control"""
        print("\n=== Testing LED PWM Control ===")
        
        # Test different brightness levels
        test_levels = [0, 25, 50, 75, 100]
        all_passed = True
        
        for brightness in test_levels:
            print(f"Testing brightness: {brightness}%")
            response = await self.send_command("set_led_brightness", brightness=brightness)
            
            if response and response.get("type") == "led_status":
                actual_brightness = response.get("brightness", -1)
                pwm_value = response.get("pwm_value", -1)
                
                if actual_brightness == brightness:
                    print(f"✓ Brightness set to {brightness}% (PWM: {pwm_value})")
                else:
                    print(f"✗ Expected {brightness}%, got {actual_brightness}%")
                    all_passed = False
            else:
                print(f"✗ Failed to set brightness to {brightness}%")
                all_passed = False
            
            await asyncio.sleep(1)  # Brief delay between tests
        
        if all_passed:
            print("✓ LED PWM test passed")
            self.test_results["led_pwm"] = "PASS"
        else:
            print("✗ LED PWM test failed")
            self.test_results["led_pwm"] = "FAIL"
        
        return all_passed
    
    async def test_temperature_sensor(self):
        """Test temperature sensor reading"""
        print("\n=== Testing Temperature Sensor ===")
        
        # Single reading test
        response = await self.send_command("read_temperature")
        
        if response and response.get("type") == "temperature_reading":
            temperature = response.get("temperature", -999)
            voltage = response.get("voltage", 0)
            
            print(f"✓ Temperature: {temperature:.1f}°C")
            print(f"✓ Sensor voltage: {voltage:.3f}V")
            
            # Reasonable temperature range check (0-50°C for typical indoor)
            if 0 <= temperature <= 50:
                print("✓ Temperature reading is reasonable")
                self.test_results["temperature"] = "PASS"
                return True
            else:
                print("⚠ Temperature reading seems unusual but sensor is responding")
                self.test_results["temperature"] = "PARTIAL"
                return True
        else:
            print("✗ Temperature sensor test failed")
            self.test_results["temperature"] = "FAIL"
            return False
    
    async def test_temperature_monitoring(self):
        """Test continuous temperature monitoring"""
        print("\n=== Testing Temperature Monitoring ===")
        
        # Start monitoring
        response = await self.send_command("start_temperature_monitoring")
        if not response or response.get("type") != "status":
            print("✗ Failed to start temperature monitoring")
            return False
        
        print("✓ Temperature monitoring started")
        
        # Listen for automatic readings
        readings_received = 0
        start_time = time.time()
        
        try:
            while readings_received < 3 and (time.time() - start_time) < 15:
                response = await asyncio.wait_for(self.websocket.recv(), timeout=5.0)
                data = json.loads(response)
                
                if data.get("type") == "temperature_reading":
                    readings_received += 1
                    temp = data.get("temperature", 0)
                    print(f"✓ Auto reading {readings_received}: {temp:.1f}°C")
        
        except asyncio.TimeoutError:
            print("⚠ Timeout waiting for automatic readings")
        
        # Stop monitoring
        await self.send_command("stop_temperature_monitoring")
        print("✓ Temperature monitoring stopped")
        
        if readings_received >= 2:
            print("✓ Temperature monitoring test passed")
            return True
        else:
            print("✗ Temperature monitoring test failed")
            return False
    
    async def test_light_sensor(self):
        """Test light intensity sensor"""
        print("\n=== Testing Light Sensor ===")
        
        response = await self.send_command("read_light")
        
        if response and response.get("type") == "light_reading":
            light_intensity = response.get("light_intensity", -1)
            voltage = response.get("voltage", 0)
            resistance = response.get("resistance", 0)
            
            print(f"✓ Light intensity: {light_intensity:.1f} lux")
            print(f"✓ Sensor voltage: {voltage:.3f}V")
            print(f"✓ LDR resistance: {resistance:.1f}Ω")
            
            if light_intensity >= 0:
                print("✓ Light sensor test passed")
                self.test_results["light_sensor"] = "PASS"
                return True
            else:
                print("✗ Invalid light reading")
                self.test_results["light_sensor"] = "FAIL"
                return False
        else:
            print("✗ Light sensor test failed")
            self.test_results["light_sensor"] = "FAIL"
            return False
    
    async def test_logic_gates(self):
        """Test logic gate simulation"""
        print("\n=== Testing Logic Gates ===")
        
        gate_types = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"]
        test_inputs = [(False, False), (False, True), (True, False), (True, True)]
        
        # Expected outputs for each gate type
        expected_outputs = {
            "AND": [False, False, False, True],
            "OR": [False, True, True, True],
            "NOT": [True, True, False, False],  # Only uses input A
            "NAND": [True, True, True, False],
            "NOR": [True, False, False, False],
            "XOR": [False, True, True, False]
        }
        
        all_passed = True
        
        for gate_type in gate_types:
            print(f"\nTesting {gate_type} gate:")
            gate_passed = True
            
            for i, (input_a, input_b) in enumerate(test_inputs):
                response = await self.send_command("set_logic_gate", 
                                                 gate_type=gate_type,
                                                 input_a=input_a,
                                                 input_b=input_b)
                
                if response and response.get("type") == "logic_gate_result":
                    actual_output = response.get("output", None)
                    expected_output = expected_outputs[gate_type][i]
                    
                    if actual_output == expected_output:
                        print(f"✓ {gate_type}({int(input_a)},{int(input_b)}) = {int(actual_output)}")
                    else:
                        print(f"✗ {gate_type}({int(input_a)},{int(input_b)}) = {int(actual_output)}, expected {int(expected_output)}")
                        gate_passed = False
                        all_passed = False
                else:
                    print(f"✗ Failed to test {gate_type}({int(input_a)},{int(input_b)})")
                    gate_passed = False
                    all_passed = False
                
                await asyncio.sleep(0.5)  # Brief delay between tests
            
            if gate_passed:
                print(f"✓ {gate_type} gate passed")
            else:
                print(f"✗ {gate_type} gate failed")
        
        if all_passed:
            print("\n✓ All logic gate tests passed")
            self.test_results["logic_gates"] = "PASS"
        else:
            print("\n✗ Some logic gate tests failed")
            self.test_results["logic_gates"] = "FAIL"
        
        return all_passed
    
    async def run_all_tests(self):
        """Run all experiment tests"""
        print("=" * 60)
        print("REMOTE LABORATORY MULTI-EXPERIMENT TEST SUITE")
        print("=" * 60)
        
        if not await self.connect():
            return False
        
        try:
            # Run all tests
            await self.test_ping()
            await self.test_resistor_measurement()
            await self.test_led_pwm()
            await self.test_temperature_sensor()
            await self.test_temperature_monitoring()
            await self.test_light_sensor()
            await self.test_logic_gates()
            
        finally:
            await self.disconnect()
        
        # Print summary
        self.print_test_summary()
        
        return all(result == "PASS" for result in self.test_results.values())
    
    def print_test_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result == "PASS")
        partial_tests = sum(1 for result in self.test_results.values() if result == "PARTIAL")
        failed_tests = sum(1 for result in self.test_results.values() if result == "FAIL")
        
        for test_name, result in self.test_results.items():
            status_symbol = "✓" if result == "PASS" else "⚠" if result == "PARTIAL" else "✗"
            print(f"{status_symbol} {test_name.replace('_', ' ').title()}: {result}")
        
        print("-" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Partial: {partial_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Remote laboratory is fully functional.")
        elif partial_tests > 0 and failed_tests == 0:
            print("\n⚠ Tests completed with warnings. Check partial results.")
        else:
            print(f"\n❌ {failed_tests} test(s) failed. Check hardware and firmware.")

async def main():
    """Main test function"""
    if len(sys.argv) > 1:
        host = sys.argv[1]
    else:
        host = input("Enter ESP32 IP address (default: 192.168.1.100): ").strip()
        if not host:
            host = "192.168.1.100"
    
    tester = RemoteLabTester(host=host)
    success = await tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)
