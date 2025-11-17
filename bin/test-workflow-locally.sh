#!/bin/bash
# Test GitHub Actions workflow locally using act
# https://github.com/nektos/act

set -e

echo "=================================="
echo "GitHub Actions Local Testing"
echo "=================================="
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ 'act' is not installed"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install act"
    echo "  Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo ""
    echo "Or use Docker:"
    echo "  docker run --rm -it -v \$(pwd):/workspace -w /workspace nektos/act:latest"
    exit 1
fi

echo "✅ act is installed"
echo ""

# Create secrets file if it doesn't exist
if [ ! -f .secrets ]; then
    echo "Creating .secrets file template..."
    cat > .secrets << 'EOF'
# GitHub Actions secrets for local testing
# DO NOT COMMIT THIS FILE (it's in .gitignore)

AWS_ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsRole
LIGHTSAIL_INSTANCE_NAME=superhero-ttrpg-instance
EOF
    echo "⚠️  Please edit .secrets file with your actual values"
    echo "   File created at: .secrets"
    exit 0
fi

echo "Available test modes:"
echo ""
echo "1. Dry run (just list jobs)"
echo "2. Build job only (test Docker build)"
echo "3. Full workflow (build + deploy)"
echo "4. Manual step-by-step"
echo ""
read -p "Select mode (1-4): " MODE

case $MODE in
    1)
        echo "Listing workflow jobs..."
        act -l
        ;;
    2)
        echo "Testing build job only..."
        act --secret-file .secrets --job build-and-deploy --dry-run
        echo ""
        echo "💡 Add --verbose for detailed output"
        ;;
    3)
        echo "⚠️  This will attempt real deployment!"
        read -p "Are you sure? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            act --secret-file .secrets push
        fi
        ;;
    4)
        echo "Manual step-by-step testing..."
        echo ""
        echo "Run each command manually:"
        echo ""
        echo "# 1. Build Docker image"
        echo "docker build -t superhero-ttrpg:test ."
        echo ""
        echo "# 2. Test image locally"
        echo "docker run -p 3000:3000 -v \$(pwd)/data:/app/data superhero-ttrpg:test"
        echo ""
        echo "# 3. Test health endpoint"
        echo "curl http://localhost:3000/api/health"
        echo ""
        echo "# 4. Simulate ECR push (tag only, don't push)"
        echo "docker tag superhero-ttrpg:test YOUR_ECR_REGISTRY/superhero-ttrpg:latest"
        echo ""
        echo "# 5. Test SSM command (dry-run)"
        echo "aws ssm send-command --instance-ids i-xxxxx --document-name AWS-RunShellScript --parameters commands='[\"echo test\"]' --dry-run"
        ;;
    *)
        echo "Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "✅ Test complete!"