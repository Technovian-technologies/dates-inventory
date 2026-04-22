# 🚀 Run Database Migration NOW

## Current Status

✅ Code is updated to use UUID  
❌ Database still uses integer IDs  
⚠️ **You need to run the migration to update the database**

## Quick Migration (Recommended)

### Option 1: Using the Migration Script (Easiest)

```bash
cd backend
./migrate-database.sh
```

This will:

1. Ask for confirmation
2. Drop all existing tables
3. Recreate tables with UUID support
4. Insert sample data with UUIDs
5. Display the generated UUIDs

### Option 2: Manual Migration

If you prefer to run it manually:

```bash
# Connect to your database
mysql -h 192.168.0.246 -u remoteuser -p dates_inventory

# Then paste the contents of backend/database/migrate-to-uuid.sql
# Or run it directly:
mysql -h 192.168.0.246 -u remoteuser -p dates_inventory < backend/database/migrate-to-uuid.sql
```

## After Migration

### 1. Get the Generated UUIDs

The migration will output the UUIDs. You'll see something like:

```
Warehouses:
+--------------------------------------+---------------------+
| id                                   | name                |
+--------------------------------------+---------------------+
| 550e8400-e29b-41d4-a716-446655440000 | Main Storage        |
| 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | Cold Storage A      |
| 7c9e6679-7425-40de-944b-e07fc1f90ae7 | Distribution Center |
+--------------------------------------+---------------------+

Varieties:
+--------------------------------------+-------------+
| id                                   | name        |
+--------------------------------------+-------------+
| 123e4567-e89b-12d3-a456-426614174000 | Medjool     |
| 987fcdeb-51a2-43f7-8f9e-123456789abc | Deglet Noor |
| a1b2c3d4-e5f6-7890-abcd-ef1234567890 | Ajwa        |
| b2c3d4e5-f6a7-8901-bcde-f12345678901 | Barhi       |
| c3d4e5f6-a7b8-9012-cdef-123456789012 | Sukkari     |
+--------------------------------------+-------------+
```

### 2. Update Frontend Modals

You need to update the dropdown options in your modals to use these UUIDs:

**File: `src/components/modals/AddBatchModal.tsx`**

Find this section:

```tsx
<select value={formData.varietyId} ...>
  <option value="">Select variety</option>
  <option value="1">Medjool</option>  {/* ❌ OLD */}
  <option value="2">Deglet Noor</option>
  ...
</select>
```

Replace with the actual UUIDs:

```tsx
<select value={formData.varietyId} ...>
  <option value="">Select variety</option>
  <option value="123e4567-e89b-12d3-a456-426614174000">Medjool</option>  {/* ✅ NEW */}
  <option value="987fcdeb-51a2-43f7-8f9e-123456789abc">Deglet Noor</option>
  ...
</select>
```

Do the same for:

- Warehouse dropdown in AddBatchModal
- Variety dropdown in EditBatchModal
- Warehouse dropdown in EditBatchModal

### 3. Restart Backend Server

```bash
cd backend
bun run start:dev
```

### 4. Test the Application

1. Login to your app
2. Go to Inventory page
3. Click "Add Batch"
4. Select a variety and warehouse
5. Fill in the form
6. Upload an image (optional)
7. Submit

It should work now! ✅

## What Changed?

### Before (Integer IDs)

```json
{
  "varietyId": 1,
  "warehouseId": 1,
  "quantity": 1000
}
```

### After (UUID)

```json
{
  "varietyId": "123e4567-e89b-12d3-a456-426614174000",
  "warehouseId": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 1000
}
```

## Troubleshooting

### Error: "Variety with ID X not found"

- You're still using integer IDs in the frontend
- Update the dropdown values to use UUIDs

### Error: "Command not found: mysql"

- MySQL client is not installed on your Mac
- Install it: `brew install mysql-client`
- Or run the migration directly on your database server

### Error: "Access denied"

- Check your database credentials in the script
- Make sure the user has permission to drop/create tables

### Migration Script Won't Run

- Make sure it's executable: `chmod +x backend/migrate-database.sh`
- Or run it with bash: `bash backend/migrate-database.sh`

## Important Notes

⚠️ **This migration will DELETE all existing data**

- Make a backup first if you have important data
- All users, batches, sales will be lost
- Sample data will be inserted automatically

✅ **After migration, you'll have:**

- 3 Warehouses with UUIDs
- 5 Varieties with UUIDs
- 3 Customers with UUIDs
- Empty batches, sales, and users tables

🔄 **Need to preserve existing data?**

- You'll need a more complex migration script
- Contact me if you need help with data preservation

## Quick Checklist

- [ ] Backup database (if needed)
- [ ] Run migration script
- [ ] Copy generated UUIDs
- [ ] Update AddBatchModal dropdown values
- [ ] Update EditBatchModal dropdown values
- [ ] Restart backend server
- [ ] Test creating a batch
- [ ] Verify it works!

## Ready to Migrate?

```bash
cd backend
./migrate-database.sh
```

Good luck! 🚀
