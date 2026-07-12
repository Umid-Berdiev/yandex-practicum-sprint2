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

# Задание 4

Helm-чарты для прокси-сервиса и сервиса событий успешно реализованы, настроены и развернуты:

1. **Настройка `values.yaml`**: Перенесены конфигурации для `proxyService` и `eventsService` с актуальными Docker-образами. Настроен секрет для скачивания образов `imagePullSecrets`.
2. **Шаблонизация ресурсов Deployment и Service**: В папке `./src/kubernetes/helm/templates/services/` реализованы полноценные Helm-шаблоны `proxy-service.yaml` и `events-service.yaml`. Хардкод-значения вынесены в `values.yaml`, сделав развертывание гибким и удобным.
3. **Развёртывание и тестирование**:
   - Старые "голые" манифесты Kubernetes были полностью удалены.
   - Развернута сборка с помощью: `helm install cinemaabyss ./src/kubernetes/helm --namespace cinemaabyss --create-namespace`.
   - Ingress, Proxy и Movies работают исправно. Локальные интеграционные тесты (22/22) Postman успешно пройдены через `cinemaabyss.example.com`.

- Скриншот развертывания helm: [helm_deployment.png](./screenshots/helm_deployment.png)
- Скриншот вызова API Movies: [api_movies.png](./screenshots/api_movies.png)

## Удаляем все

```bash
kubectl delete all --all -n cinemaabyss
kubectl delete namespace cinemaabyss
```
