# Carbon-Footprint-Tracker-for-Cloud-Resources
A cloud sustainability platform that monitors cloud resources, calculates carbon footprint, visualizes analytics, and suggests optimization strategies to reduce energy consumption and emissions.


# Carbon Footprint Tracker for Cloud Resources

## Overview

The Carbon Footprint Tracker for Cloud Resources is a cloud computing project designed to monitor cloud resource usage, estimate carbon emissions, and provide optimization recommendations. The system helps organizations understand the environmental impact of their cloud infrastructure and identify opportunities to reduce energy consumption and operational costs.



## Problem Statement

Many organizations use cloud resources without knowing their energy consumption or environmental impact. This can lead to unnecessary carbon emissions and increased operational costs.



## Objectives

* Monitor cloud resource usage
* Estimate energy consumption
* Calculate carbon emissions
* Visualize analytics through dashboards
* Provide optimization recommendations
* Promote sustainable cloud computing practices



## Features

### Authentication

* User Login
* User Registration
* Protected Routes
* Session Management

### Resource Management

* Add Cloud Resources
* Update Resource Details
* Delete Resources
* View Resource Inventory

### Carbon Emission Calculator

* Energy Consumption Estimation
* Carbon Footprint Calculation
* Region-Based Carbon Intensity Support

### Analytics Dashboard

* Total Resources
* Total Energy Consumption
* Total Carbon Emissions
* Provider-wise Emissions
* Top Polluting Resources
* Weekly and Monthly Trends

### Optimization Recommendations

* Detect Underutilized Resources
* Identify Long-Running Resources
* Suggest Storage Cleanup
* Recommend Cost and Carbon Reduction Actions



## Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Recharts

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Authentication

* Firebase Authentication (Development Mode: Mock Authentication)

### DevOps

* Docker
* Docker Compose
* GitHub Actions



## Project Architecture

Cloud Resources
↓
Usage Data Collection
↓
Carbon Emission Calculator
↓
PostgreSQL Database
↓
Analytics Dashboard
↓
Optimization Recommendations

---

## Carbon Emission Formula

Energy Consumption (kWh)

Energy = CPU Usage × Runtime Hours × 0.05

Carbon Emission (kg CO₂e)

Carbon Emission = Energy Consumption × Carbon Intensity Factor

Example:

CPU Usage = 50%
Runtime = 10 Hours

Energy Consumption = 50 × 10 × 0.05 = 25 kWh

Carbon Emission = 25 × 0.38 = 9.5 kg CO₂e


### Users

* User ID
* Email
* Password

### Resources

* Resource Name
* Cloud Provider
* Region
* Resource Type
* CPU Usage
* Storage Usage
* Runtime Hours

### Emission Records

* Resource ID
* Energy Consumption
* Carbon Emission



## Demo Video

Demo Video Link:
https://drive.google.com/file/d/1A5VNSqf-VIe2fJ6p9wzkjRsnCYrJ9oKz/view?usp=drive_link



## Future Enhancements

* Real AWS CloudWatch Integration
* Azure Monitor Integration
* Google Cloud Monitoring Integration
* Real-Time Resource Tracking
* Carbon Emission Forecasting using Machine Learning
* Multi-User Role Management

