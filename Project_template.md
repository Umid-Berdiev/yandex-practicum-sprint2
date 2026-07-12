## Изучите [README.md](.\README.md) файл и структуру проекта.

# Задание 1

1. Спроектируйте to be архитектуру КиноБездны, разделив всю систему на отдельные домены и организовав интеграционное взаимодействие и единую точку вызова сервисов.
   Результат представьте в виде контейнерной диаграммы в нотации С4.
   Добавьте ссылку на файл в этот шаблон
   [Диаграмма архитектуры C4 To-Be](./images/architecture.md)

# Задание 2

### 1. Proxy
Сервис proxy реализован (на Go) и добавлен в `./src/microservices/proxy`.
Postman-тесты к API Gateway успешно пройдены.
Переменная `MOVIES_MIGRATION_PERCENT` протестирована в docker-compose, трафик меняет свое направление в зависимости от процентов.

### 2. Kafka
Реализован MVP-сервис `events` (на Node.js/kafkajs) и добавлен в `./src/microservices/events`. Сервис принимает запросы и публикует/читает сообщения в Kafka топиках `movie-events`, `user-events`, `payment-events`.
Скриншоты:
- Тесты: [Скриншот тестов](./screenshots/tests.png)
- Состояние топиков Kafka (UI http://localhost:8090): [Скриншот Kafka](./screenshots/kafka_ui.png)

# Задание 3

### 1. CI/CD
Доработан пайплайн `docker-build-push.yml`, добавлены шаги для сборки и пуша образов `events-service` и `proxy-service`. Тесты в `api-tests.yml` будут выполняться при обновлениях.
Все запуски CI/CD успешны (зелёные).

### 2. Kubernetes
Созданы необходимые конфигурационные файлы для Proxy и Events сервисов в папке `src/kubernetes`:
- Добавлен Deployment и Service в `events-service.yaml`
- Добавлен Deployment и Service в `proxy-service.yaml`
- Обновлен `ingress.yaml` для маршрутизации трафика к `events-service` и `proxy-service` (/api/events и /).

Логи и корректная работа проверены. Переключение `MOVIES_MIGRATION_PERCENT` меняет маршрутизацию на microservices.
- Скриншот вызова Kubernetes API: [Скриншот Kubernetes Movies](./screenshots/kubernetes_movies.png)
- Логи Event Service: [Скриншот логов Events](./screenshots/events_logs.png)

