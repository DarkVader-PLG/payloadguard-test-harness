// Package main provides utility functions and types for the application server.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Config holds application configuration.
type Config struct {
	Host     string
	Port     int
	Timeout  time.Duration
	LogLevel string
}

// Server represents the HTTP application server.
type Server struct {
	config  Config
	mux     *http.ServeMux
	started bool
}

// Response is a standard JSON API response wrapper.
type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// NewConfig returns a Config with sensible defaults.
func NewConfig() Config {
	return Config{
		Host:     "0.0.0.0",
		Port:     8080,
		Timeout:  30 * time.Second,
		LogLevel: "info",
	}
}

// Start begins listening for HTTP requests.
func (s *Server) Start() error {
	if s.started {
		return fmt.Errorf("server already started")
	}
	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)
	log.Printf("Starting server on %s", addr)
	s.started = true
	return http.ListenAndServe(addr, s.mux)
}

// Stop gracefully shuts down the server.
func (s *Server) Stop() {
	s.started = false
	log.Println("Server stopped")
}

// WriteJSON writes a JSON response to the ResponseWriter.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("WriteJSON error: %v", err)
	}
}

// WriteError writes a standardised error response.
func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, Response{
		Status:  status,
		Message: message,
	})
}

func main() {
	cfg := NewConfig()
	srv := &Server{config: cfg, mux: http.NewServeMux()}
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
