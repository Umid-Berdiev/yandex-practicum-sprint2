package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port                   string
	MonolithURL            string
	MoviesServiceURL       string
	EventsServiceURL       string
	GradualMigration       bool
	MoviesMigrationPercent int
}

func loadConfig() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	monolithURL := os.Getenv("MONOLITH_URL")
	if monolithURL == "" {
		monolithURL = "http://monolith:8080"
	}

	moviesServiceURL := os.Getenv("MOVIES_SERVICE_URL")
	if moviesServiceURL == "" {
		moviesServiceURL = "http://movies-service:8081"
	}

	eventsServiceURL := os.Getenv("EVENTS_SERVICE_URL")
	if eventsServiceURL == "" {
		eventsServiceURL = "http://events-service:8082"
	}

	gradualMigrationStr := os.Getenv("GRADUAL_MIGRATION")
	gradualMigration := gradualMigrationStr == "true"

	moviesMigrationPercentStr := os.Getenv("MOVIES_MIGRATION_PERCENT")
	moviesMigrationPercent, err := strconv.Atoi(moviesMigrationPercentStr)
	if err != nil {
		moviesMigrationPercent = 0
	}

	return Config{
		Port:                   port,
		MonolithURL:            monolithURL,
		MoviesServiceURL:       moviesServiceURL,
		EventsServiceURL:       eventsServiceURL,
		GradualMigration:       gradualMigration,
		MoviesMigrationPercent: moviesMigrationPercent,
	}
}

func main() {
	config := loadConfig()

	monolithUrl, err := url.Parse(config.MonolithURL)
	if err != nil {
		log.Fatalf("Invalid monolith URL: %v", err)
	}

	moviesServiceUrl, err := url.Parse(config.MoviesServiceURL)
	if err != nil {
		log.Fatalf("Invalid movies service URL: %v", err)
	}

	eventsServiceUrl, err := url.Parse(config.EventsServiceURL)
	if err != nil {
		log.Fatalf("Invalid events service URL: %v", err)
	}

	monolithProxy := httputil.NewSingleHostReverseProxy(monolithUrl)
	moviesProxy := httputil.NewSingleHostReverseProxy(moviesServiceUrl)
	eventsProxy := httputil.NewSingleHostReverseProxy(eventsServiceUrl)

	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/api/proxy/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"status": true})
	})
	
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		if strings.HasPrefix(path, "/api/events") {
			eventsProxy.ServeHTTP(w, r)
			return
		}

		if strings.HasPrefix(path, "/api/movies") {
			if config.GradualMigration {
				randomValue := rand.Intn(100)
				if randomValue < config.MoviesMigrationPercent {
					moviesProxy.ServeHTTP(w, r)
					return
				} else {
					monolithProxy.ServeHTTP(w, r)
					return
				}
			} else {
				moviesProxy.ServeHTTP(w, r)
				return
			}
		}

		// Defaults to monolith
		monolithProxy.ServeHTTP(w, r)
	})

	fmt.Printf("Proxy service running on port %s\n", config.Port)
	if err := http.ListenAndServe(":"+config.Port, nil); err != nil {
		log.Fatalf("Could not start proxy server: %v", err)
	}
}
