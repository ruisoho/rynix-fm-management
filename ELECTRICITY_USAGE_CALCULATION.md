# Electricity Usage Calculation Implementation

## Overview

This document describes the implementation of electricity usage calculation in the Rynix FM Management system. The system calculates consumption by taking the difference between consecutive meter readings, treating the first reading as a baseline that is excluded from usage data.

## Calculation Logic

### Basic Principle
- **Baseline Reading**: The first reading (e.g., 1234) is treated as the starting point
- **Consumption Calculation**: Usage = Current Reading - Previous Reading
- **Baseline Exclusion**: The first reading shows 0 consumption and is marked as baseline

### Example
```
Day 1: Reading = 1234 → Consumption = 0 (baseline)
Day 2: Reading = 1324 → Consumption = 1324 - 1234 = 90 units
Day 3: Reading = 1450 → Consumption = 1450 - 1324 = 126 units
```

## Implementation Details

### Backend Implementation

#### 1. Performance Optimizer Service
Location: `backend/services/performanceOptimizer.js`

The energy consumption query uses Common Table Expressions (CTEs) to calculate consumption:

```sql
WITH ordered_readings AS (
  SELECT 
    mr2.value,
    LAG(mr2.value) OVER (ORDER BY mr2.date) as prev_value,
    ROW_NUMBER() OVER (ORDER BY mr2.date) as row_num
  FROM meter_readings mr2 
  WHERE mr2.meter_id = em.id 
    AND strftime('%Y-%m', mr2.date) = strftime('%Y-%m', mr.date)
    AND mr2.value IS NOT NULL
  ORDER BY mr2.date
)
SELECT COALESCE(SUM(
  CASE 
    WHEN row_num > 1 AND prev_value IS NOT NULL 
    THEN GREATEST(0, value - prev_value)
    ELSE 0
  END
), 0)
FROM ordered_readings
```

#### 2. Individual Meter Consumption API
Endpoint: `GET /api/meters/:meterId/consumption`

Query parameters:
- `startDate` (optional): Filter readings from this date
- `endDate` (optional): Filter readings until this date

Response format:
```json
[
  {
    "id": 1,
    "meter_id": 123,
    "value": 1234,
    "date": "2024-01-01",
    "notes": null,
    "consumption": 0,
    "is_baseline": true
  },
  {
    "id": 2,
    "meter_id": 123,
    "value": 1324,
    "date": "2024-01-02",
    "notes": null,
    "consumption": 90,
    "is_baseline": false
  }
]
```

### Frontend Implementation

#### 1. Charts and Reports
Location: `frontend/src/pages/ChartsReports.jsx`

The `getIndividualMeterData` function implements the same logic:

```javascript
const getIndividualMeterData = (meterId) => {
  // ... filtering and sorting logic
  
  return readings
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((reading, index, arr) => {
      const consumption = index > 0 ? reading.value - arr[index - 1].value : 0;
      return {
        date: format(parseISO(reading.date), 'MMM dd'),
        value: reading.value,
        consumption: Math.max(0, consumption), // Ensure non-negative
        meter: meter.serial_number,
        type: meter.type
      };
    });
};
```

#### 2. API Context
Location: `frontend/src/contexts/ApiContext.jsx`

New function to access consumption data:

```javascript
const getMeterConsumption = useCallback((meterId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  return handleApiCall(() => 
    axios.get(`/api/meters/${meterId}/consumption${queryString}`)
      .then(res => res.data)
  );
}, [handleApiCall]);
```

## Usage Examples

### 1. Get Consumption Data for a Specific Meter

```javascript
import { useApi } from '../contexts/ApiContext';

const { getMeterConsumption } = useApi();

// Get all consumption data for meter ID 123
const consumptionData = await getMeterConsumption(123);

// Get consumption data for a date range
const rangeData = await getMeterConsumption(123, '2024-01-01', '2024-01-31');
```

### 2. Filter Out Baseline Readings for Charts

```javascript
// Filter out baseline readings (consumption = 0)
const usageData = consumptionData.filter(reading => !reading.is_baseline);

// Use only consumption values for chart data
const chartData = usageData.map(reading => ({
  date: reading.date,
  consumption: reading.consumption
}));
```

### 3. Calculate Total Consumption

```javascript
// Calculate total consumption (excluding baseline)
const totalConsumption = consumptionData
  .filter(reading => !reading.is_baseline)
  .reduce((total, reading) => total + reading.consumption, 0);
```

## Key Features

### 1. Baseline Handling
- First reading is automatically identified as baseline
- Baseline readings show `consumption: 0` and `is_baseline: true`
- Charts and analysis exclude baseline readings

### 2. Negative Consumption Protection
- Uses `GREATEST(0, value - prev_value)` in SQL
- Uses `Math.max(0, consumption)` in JavaScript
- Prevents negative consumption values from meter reading errors

### 3. Date Range Filtering
- Backend supports flexible date filtering
- Frontend can request specific time periods
- Maintains chronological order for accurate calculations

### 4. Null Value Handling
- Filters out readings with null values
- Ensures calculations only use valid data points
- Maintains data integrity across the system

## Data Flow

1. **Meter Readings Input**: Raw meter readings stored in database
2. **Backend Processing**: SQL queries calculate consumption differences
3. **API Response**: Structured data with consumption and baseline flags
4. **Frontend Display**: Charts and reports use consumption values only
5. **Analysis**: Baseline readings excluded from all usage calculations

## Benefits

### 1. Accurate Consumption Tracking
- True usage calculation based on meter differences
- Eliminates baseline reading from consumption data
- Provides realistic energy usage patterns

### 2. Consistent Implementation
- Same logic across backend and frontend
- Unified calculation methodology
- Reliable data for reporting and analysis

### 3. Flexible Data Access
- Multiple API endpoints for different use cases
- Date range filtering capabilities
- Structured response format for easy integration

### 4. Error Prevention
- Negative consumption protection
- Null value filtering
- Data validation at multiple levels

## Testing the Implementation

### 1. Backend API Testing

```bash
# Test individual meter consumption
curl "http://localhost:3001/api/meters/1/consumption"

# Test with date range
curl "http://localhost:3001/api/meters/1/consumption?startDate=2024-01-01&endDate=2024-01-31"
```

### 2. Frontend Integration Testing

```javascript
// Test in browser console
const api = useApi();
api.getMeterConsumption(1).then(data => console.log(data));
```

### 3. Verify Calculation Logic

1. Add test meter readings: 1000, 1100, 1250
2. Expected consumption: 0, 100, 150
3. Verify baseline reading shows `is_baseline: true`
4. Confirm charts exclude baseline reading

## Maintenance and Updates

### 1. Database Optimization
- Indexes on `meter_id` and `date` columns
- Regular database maintenance for performance
- Archive old readings to maintain query speed

### 2. Code Consistency
- Keep backend and frontend logic synchronized
- Update both implementations when making changes
- Maintain comprehensive test coverage

### 3. Data Validation
- Regular audits of consumption calculations
- Monitor for negative consumption values
- Validate baseline identification accuracy

---

**Implementation Status**: ✅ Complete
**Last Updated**: February 2025
**Version**: 1.1.0