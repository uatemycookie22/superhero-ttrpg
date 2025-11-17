#!/bin/bash
# Backup SQLite database script

set -e

BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_PATH=${DATABASE_PATH:-"./data/superhero-ttrpg.db"}
BACKUP_FILE="$BACKUP_DIR/superhero-ttrpg_$TIMESTAMP.db"

echo "Database Backup Script"
echo "======================"
echo ""
echo "Source: $DB_PATH"
echo "Destination: $BACKUP_FILE"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at: $DB_PATH"
    exit 1
fi

# Perform backup
echo "Creating backup..."
cp "$DB_PATH" "$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

COMPRESSED_FILE="${BACKUP_FILE}.gz"
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

echo ""
echo "✅ Backup created successfully!"
echo "   File: $COMPRESSED_FILE"
echo "   Size: $FILE_SIZE"
echo ""

# Clean up old backups (keep last 7)
echo "Cleaning up old backups (keeping last 7)..."
cd $BACKUP_DIR
ls -t *.db.gz 2>/dev/null | tail -n +8 | xargs -r rm --
REMAINING=$(ls -1 *.db.gz 2>/dev/null | wc -l)
echo "✅ $REMAINING backup(s) retained"

echo ""
echo "Backup complete!"