package main

import (
	"flag"
	"github.com/labstack/echo/middleware"
	"net"
	"net/http"
	"os"
	"io/ioutil"
	"encoding/json"
	"bytes"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
)

var logger = logrus.New()

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest-services/backend.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logger.SetOutput(os.Stdout)

	logMiddleware := middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper: middleware.DefaultSkipper,
		Format: `{"time":"${time_rfc3339_nano}","id":"${id}",` +
			`"method":"${method}","uri":"${uri}",` +
			`"status":${status},"error":"${error}"` +
			`}` + "\n",
		CustomTimeFormat: "2006-01-02 15:04:05.00000",
		Output:           logger.Writer(),
	})

	logger.Infof("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true
	router.Use(logMiddleware)
	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		logger.Fatal(err)
	}
	router.Listener = ln

	router.GET("/hello", hello)

	router.GET("/chat", chatGet)

	router.POST("/chat", chat)

	logger.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func hello(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "hello"})
}

func chatGet(c echo.Context) error {
	return c.String(http.StatusOK, "ok")
}

func chat(c echo.Context) error {
	type body struct {
		Message string `json:"message"`
	}

	reqBody := new(body)

	if err := c.Bind(reqBody); err != nil {
		return err
	}

	request, error := json.Marshal(reqBody)

	if error != nil {
		return error
	}

	posturl := "https://docker-ai-ass.onrender.com/chat"

	bodyReader := []byte(string(request))

	r, err := http.NewRequest("POST", posturl, bytes.NewBuffer(bodyReader))
	if err != nil {
		panic(err)
	}

	r.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(r)
	if err != nil {
		panic(err)
	}

	defer res.Body.Close()
	bodyRes, err := ioutil.ReadAll(res.Body)

	if err != nil {
		return err
	}

	bodyString := string(bodyRes)

	return c.String(http.StatusOK, bodyString)
}

type HTTPMessageBody struct {
	Message string
}
