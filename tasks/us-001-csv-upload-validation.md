# US-001: CSV Upload and Validation

**Description:** As a user, I want to upload a CSV file with price data so the app can backtest strategies against historical data.

## Acceptance Criteria

- [ ] File upload button accepts .csv files
- [ ] Strict validation enforces required headers: time, high, low, close, RSI, date
- [ ] Date column must be DD-MM-YYYY format (e.g., 31-12-2024)
- [ ] Reject files with missing values, malformed dates, or incorrect headers
- [ ] Show clear error message specifying validation failure reason
- [ ] Require minimum 160 days of data (for maximum SMA period warmup)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Technical Notes

### CSV Format Requirements
- Headers: `time`, `high`, `low`, `close`, `RSI`, `date`
- Date format: DD-MM-YYYY (e.g., 31-12-2024)
- Minimum rows: 160 (warmup period for maximum SMA)
- All fields must be non-empty and valid numbers (except date)

### Validation Steps
1. Check file extension is .csv
2. Parse CSV headers and validate exact matches
3. Validate date format using regex: `\d{2}-\d{2}-\d{4}`
4. Validate all numeric fields are valid numbers
5. Check row count >= 160
6. Return specific error message on validation failure
