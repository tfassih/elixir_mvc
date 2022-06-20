defmodule ElixirMvc2.WebSocket do
  require Logger
  @moduledoc """
  ElixirMvc2.WebSocket - Contains methods for connections to outbound services and the delivery of data from application to client.
  """
  @behaviour :cowboy_websocket
  @doc """
  outbound_connect/0

  Opens a connection to 127.0.0.1 on port 30003 to dump1090's BaseStation-Format ADS-B output, sends an HTTP/1.1 GET
  request to server, and begins receiving input.

  No returns, no inputs, no overrides.
  """
  def outbound_connect do

    # start socket connection
    # {:ok, socket} = :gen_tcp.connect({127, 0, 0, 1}, 30003, [:binary, active: false, reuseaddr: true])

    case :gen_tcp.connect({127, 0, 0, 1}, 30003, [:binary, active: false, reuseaddr: true]) do
        {:ok, socket} ->
          IO.puts("Successfully connected to dump1090 BaseStation-format output")
          # create/format HTTP request
          mock_http_header = """
              GET / HTTP/1.1\r\n
              User-Agent: ElixirMvc2 Elixir Application\r\n
              Host: localhost:30003\r\n
              Accept: text/html,application/xhtml+xml,application/xml;q=0-9,image/avif,image/webp,*/*;q=0.8\r\n
              Accept-Encoding: gzip, deflate, br\r\n
              Accept-Language: en-US,en,q=0.5\r\n
              Cache-Control: no-cache\r\n
              Connection: keep-alive\r\n
              Pragma: no-cache\r\n
              Sec-Fetch-Dest: document\r\n
              Sec-Fetch-Mode: navigate\r\n
              Sec-Fetch-Site: same-origin\r\n
              Sec-Fetch-User: ?1\r\n
              Upgrade-Insecure-Requests: 1\r\n
            """
          write_line(socket, mock_http_header)
          read_line(socket)
        {:error, :econnrefused} ->
          IO.puts("Connection error on port 30003; Is dump1090 running?")
    end


    # # quick console output to inform the console of server listening
    # IO.puts("connected to 30003")
    # # write the HTTP header to the socket connection
    # write_line(socket, mock_http_header)
    # # begin recursive read
    # read_line(socket)
  end
  @spec write_line(
          port | {:"$inet", atom, any},
          binary
          | maybe_improper_list(
              binary | maybe_improper_list(any, binary | []) | byte,
              binary | []
            )
        ) :: :ok | {:error, atom | {:timeout, binary}}
  @doc """
  write_line/2

  Writes the HTTP header to the socket created by gen_tcp in outbound_connect/0
  No returns.

  INPUTS:
    socket: socket created by gen_tcp on connection, passed in from outbound_connect/0
    header: http header generated in outbound_connect/0
  """
  def write_line(socket, header) do
    :gen_tcp.send(socket, header)
  end
  @doc """
  read_line/2
  Recursive read of the socket created in outbound_connect/0
  No returns.

  INPUTS:
    socket: socket created by gen_tcp on connection, passed in from outbound_connect/0
  """
  def read_line(socket) do
    case :gen_tcp.recv(socket, 0) do
      {:ok, data} ->
        data_split = String.replace(data, "\r\n", "| ")
        Registry.ElixirMvc2 |> Registry.dispatch("/ws/test", fn(entries) ->
          for {pid, _} <- entries do
            Process.send(pid, data_split, [])
          end
        end)
        read_line(socket)
      {:error, :closed} ->
        IO.puts("Connection closed. Did dump1090 exit unexpectedly?")
      {:error, :enotconn} ->
        IO.puts("Connection closed. Did dump1090 exit unexpectedly?")
    end


  end
  @doc """
    init/2

    On init of cowboy_websocket by application, saves a map to the state variable: registry_key = path of /ws/[...] request

    RETURNS:
      {:cowboy_websocket, req, state}

    INPUTS:
      req: incoming request from client
  """
  def init(req, _state) do
    state = %{registry_key: req.path}
    {:cowboy_websocket, req, state}
  end
  @doc """
    websocket_init/1

    On websocket init, registers the state map in the registry for the app

    RETURNS:
      {:ok, state}

    INPUTS:
      state: state map made in init/2
  """
  def websocket_init(state) do
    Registry.ElixirMvc2 |> Registry.register(state.registry_key, {})
    {:ok, state}
  end
  @doc """
    websocket_handle/2

    Handle incoming messages from the client websocket

    RETURNS:
      {reply, {:text, json}, state}

    INPUTS:
      {:text, json}: a tuple representing an incoming Stringified JSON message
      state: server state map
  """
  def websocket_handle({:text, json}, state) do
    Registry.ElixirMvc2
    |> Registry.dispatch("/ws/test", fn(entries) ->
      for {pid, _} <- entries do
          Process.send(pid, "{:ok, :30003_incoming}", [])
      end
    end)

    {:reply, {:text, json}, state}
  end
  @doc """
    websocket_info

    Handle inter-process messages related to websocket, including sending info from other processes to websocket

    RETURNS:
      {:reply, {:text, info}, state}
  """
  def websocket_info(info, state) do
      {:reply, {:text, info}, state}
  end
  @doc """
    terminate

    Close websocket connection
  """
  def terminate(_reason, _req, _state) do
      :ok
  end
end
