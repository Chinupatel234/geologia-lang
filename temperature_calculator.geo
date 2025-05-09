#fossil# GEOLOGIA Temperature Converter (No Input Version)
#fossil# This program converts temperatures between Celsius and Fahrenheit

#fossil# Define a function to convert from Celsius to Fahrenheit
era celsius_to_fahrenheit
  #fossil# Get the temperature in Celsius (param0)
  sediment celsius igneous param0
  
  #fossil# Formula: F = C * 9/5 + 32
  sediment step1 igneous celsius compress 9
  sediment step2 igneous step1 dissolve 5
  sediment fahrenheit igneous step2 deposit 32
  
  #fossil# Return the result
  uplift fahrenheit
extinction

#fossil# Define a function to convert from Fahrenheit to Celsius
era fahrenheit_to_celsius
  #fossil# Get the temperature in Fahrenheit (param0)
  sediment fahrenheit igneous param0
  
  #fossil# Formula: C = (F - 32) * 5/9
  sediment step1 igneous fahrenheit erode 32
  sediment step2 igneous step1 compress 5
  sediment celsius igneous step2 dissolve 9
  
  #fossil# Return the result
  uplift celsius
extinction

#fossil# Main program - use hardcoded values instead of input
expose "GEOLOGIA Temperature Converter"
expose "=========================="

#fossil# Use hardcoded temperature values for demonstration
sediment celsius_temp igneous 25
expose "Starting with Celsius temperature:"
expose celsius_temp

#fossil# Convert from Celsius to Fahrenheit
intrusion celsius_to_fahrenheit celsius_temp
sediment f_temp igneous _return
expose "Converted to Fahrenheit:"
expose f_temp

#fossil# Use another hardcoded value for Fahrenheit
sediment fahrenheit_temp igneous 98.6
expose "Starting with Fahrenheit temperature:"
expose fahrenheit_temp

#fossil# Convert from Fahrenheit to Celsius
intrusion fahrenheit_to_celsius fahrenheit_temp
sediment c_temp igneous _return
expose "Converted to Celsius:"
expose c_temp

expose "Conversion complete!"
