---
title: "How Function Sequence in Elixir Can Trip You Up"
date: 2024-07-15T01:52Z
---

I've been getting into Elixir over the last year and have loved the experience. One thing that has bitten me is the order in which functions are defined. In most language that makes no difference but for languages that use pattern-matching this makes or breaks things, and further underlines the importance of tests.

Consider the following example where the tests defined in `GreeterTest` pass:

```
defmodule Greeter do
  def greet(%{"person" => person, "greeting" => greeting}) do
    "#{greeting}, #{person}"
  end

  def greet(%{"person" => person}) do
    "Hello, #{person}"
  end
end

defmodule GreeterTest do
  use ExUnit.Case

  test "specific greeting" do
    assert Greeter.greet(%{"person" => "Anne", "greeting" => "Hi"}) == "Hi, Anne"
  end

  test "generic greeting" do
    assert Greeter.greet(%{"person" => "Bill"}) == "Hello, Bill"
  end
end
```

However, if I switch the order of the functions defined in `Greeter`, the second test fails:

```
  1) test specific greeting (GreeterTest)
     Assertion with == failed
     code:  assert Greeter.greet(%{"person" => "Anne", "greeting" => "Hi"}) == "Hi, Anne"
     left:  "Hello, Anne"
     right: "Hi, Anne"
```

That's because Elixir scans the functions from the top and asks for each function, _Does the call being made match me?_. It finds `def greet(%{"person" => person})` and sees that the call parameters `%{"person" => "Anne", "greeting" => "Hi"}` match `%{"person" => person}` and does not bother checking the next function which is a "better" match since it matches both `person` and `greeting`.

This is why it's critical that more specific pattern matches should be specified first, with looser ones later. It also underlines the importance of having tests to make refactoring safer as moving functions around a file is pretty common and nobody quite expects any impact from that. Not in Elixir.
