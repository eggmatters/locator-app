.PHONY: deploy-stack delete-stack outputs get-key upload check-api-key start stop restart logs status ssh deploy clean-key cert renew dns help

# Every recipe below runs as a single shell, so `read` prompts and shell
# variables set on one line are still visible on the next.
.ONESHELL:

AWS_ACCOUNT_ID  := 798285207252
REGION          := us-west-2
STACK_NAME      ?= locator-app
TEMPLATE_FILE   := template.yaml

KEY_NAME  := locator-app-key
PEM_FILE  := $(HOME)/.ssh/$(KEY_NAME).pem

REMOTE_USER := ec2-user
REMOTE_DIR  := app
APP_ROOT    := ..

SSH_OPTS  = -i $(PEM_FILE) -o StrictHostKeyChecking=no
PUBLIC_IP = $(shell aws cloudformation describe-stacks \
	--stack-name $(STACK_NAME) --region $(REGION) \
	--query "Stacks[0].Outputs[?OutputKey=='PublicIP'].OutputValue" \
	--output text 2>/dev/null)

help:
	@echo "Targets:"
	@echo "  deploy        - create/update the stack, fetch the key, upload the app, and start it"
	@echo "  deploy-stack  - create/update the CloudFormation stack"
	@echo "  outputs       - show stack outputs (public IP, instance id, etc.)"
	@echo "  get-key       - fetch the generated private key as $(PEM_FILE)"
	@echo "  upload        - rsync docker-compose.prod.yml, redis.conf, locator-service, locator-client to the instance"
	@echo "  start         - docker compose (prod) up -d --build on the instance (needs TRIMET_API_KEY exported)"
	@echo "  stop          - docker compose (prod) down on the instance"
	@echo "  restart       - stop then start"
	@echo "  logs          - tail docker compose logs on the instance"
	@echo "  status        - docker compose ps on the instance"
	@echo "  ssh           - open an interactive SSH session to the instance"
	@echo "  dns           - print the A record to create at your registrar"
	@echo "  cert          - issue/install the Let's Encrypt cert via certbot (run after DNS points here)"
	@echo "  renew         - dry-run the certbot renewal on the instance"
	@echo "  delete-stack  - tear down the CloudFormation stack"
	@echo "  clean-key     - remove the local $(PEM_FILE)"
	@echo ""
	@echo "TRIMET_API_KEY must be exported in your shell before running 'start' or 'deploy';"
	@echo "'dns' and 'cert' will prompt you for the domain/email instead of hardcoding them."

deploy-stack:
	aws cloudformation deploy \
		--stack-name $(STACK_NAME) \
		--template-file $(TEMPLATE_FILE) \
		--region $(REGION)

delete-stack:
	aws cloudformation delete-stack --stack-name $(STACK_NAME) --region $(REGION)
	aws cloudformation wait stack-delete-complete --stack-name $(STACK_NAME) --region $(REGION)

outputs:
	aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) --region $(REGION) \
		--query 'Stacks[0].Outputs' --output table

get-key:
	$(eval KEY_PAIR_ID := $(shell aws ec2 describe-key-pairs \
		--key-names $(KEY_NAME) --region $(REGION) \
		--query 'KeyPairs[0].KeyPairId' --output text))
	mkdir -p $(HOME)/.ssh
	aws ssm get-parameter --name /ec2/keypair/$(KEY_PAIR_ID) \
		--with-decryption --region $(REGION) \
		--query Parameter.Value --output text > $(PEM_FILE)
	chmod 400 $(PEM_FILE)

upload:
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) 'mkdir -p $(REMOTE_DIR)'
	rsync -avz -e "ssh $(SSH_OPTS)" \
		--exclude 'node_modules' --exclude '.git' --exclude 'test' \
		$(APP_ROOT)/docker-compose.prod.yml \
		$(APP_ROOT)/redis.conf \
		$(APP_ROOT)/locator-service \
		$(APP_ROOT)/locator-client \
		$(REMOTE_USER)@$(PUBLIC_IP):~/$(REMOTE_DIR)/

check-api-key:
	if [ -z "$(TRIMET_API_KEY)" ]; then \
		echo "TRIMET_API_KEY is not set. Export it first, e.g.: export TRIMET_API_KEY=your-trimet-app-id"; \
		exit 1; \
	fi

start: check-api-key
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) \
		"cd $(REMOTE_DIR) && TRIMET_API_KEY='$(TRIMET_API_KEY)' docker compose -f docker-compose.prod.yml up -d --build"

stop:
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) \
		'cd $(REMOTE_DIR) && docker compose -f docker-compose.prod.yml down'

restart: stop start

logs:
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) \
		'cd $(REMOTE_DIR) && docker compose -f docker-compose.prod.yml logs -f'

status:
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) \
		'cd $(REMOTE_DIR) && docker compose -f docker-compose.prod.yml ps'

ssh:
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP)

deploy: check-api-key deploy-stack get-key upload start
	@echo "App available at http://$(PUBLIC_IP):3000"
	@echo "Next: 'make dns' for the A record to create, then 'make cert' once it resolves."

dns:
	read -p "Domain: " DOMAIN; \
	echo "Create this A record at your registrar (Active Domain):"; \
	echo "  $$DOMAIN  A  $(PUBLIC_IP)"; \
	echo "Verify it has propagated with: dig +short $$DOMAIN"

cert:
	read -p "Domain: " DOMAIN; \
	read -p "Email: " EMAIL; \
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) \
		"sudo certbot --nginx -d $$DOMAIN -m $$EMAIL --agree-tos --non-interactive --redirect"; \
	echo "HTTPS live at https://$$DOMAIN (direct http://$(PUBLIC_IP):3000 still open)"

renew:
	ssh $(SSH_OPTS) $(REMOTE_USER)@$(PUBLIC_IP) 'sudo certbot renew --dry-run'

clean-key:
	rm -f $(PEM_FILE)
