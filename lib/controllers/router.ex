defmodule ElixirMvc2.Router do

  use Plug.Router
  require Logger


  plug Plug.Static,
      from: :elixir_mvc_2,
      at: "/",
      only: ~w(images js ts)


  plug :match
  plug Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Poison
  plug :dispatch

  get "/" do
    file_contents = EEx.eval_file("./lib/views/main.eex")
    send_resp(conn, 200, file_contents)
  end

  match _ do
    send_resp(conn, 404, "whoops")
  end

end
