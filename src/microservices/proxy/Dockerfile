FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o proxy-service .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/proxy-service .

ENV PORT=8000

EXPOSE 8000

CMD ["./proxy-service"]
