defmodule ElixirMvc2.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  require Logger

  @impl true
  def start(_type, _args) do
    children = [
      # Starts a worker by calling: ElixirMvc2.Worker.start_link(arg)
      # {ElixirMvc2.Worker, arg}
      {Plug.Cowboy, scheme: :http, plug: ElixirMvc2.Router, options: [dispatch: dispatch(), port: cowboy_port()]},
      {Task.Supervisor, name: ElixirMvc2.SocketListener},
      Supervisor.child_spec({Task, fn -> ElixirMvc2.SocketListener.accept(4040) end}, restart: :permanent)

    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ElixirMvc2.Supervisor, strategy: :one_for_one, name: ElixirMvc2.SocketListener]
    Logger.info("Starting Application")
    # ElixirMvc2.SocketListener.accept(4040)

    Supervisor.start_link(children, opts)

  end

  defp dispatch do
    [
      {:_,
        [
          {"/ws/[...]", ElixirMvc2.WebSocket, []},
          {:_, Plug.Cowboy.Handler, {ElixirMvc2.Router, []}}
        ]
      }
    ]
  end

  defp cowboy_port, do: Application.get_env(:ElixirMvc2, :cowboy_port, 7000)
end
