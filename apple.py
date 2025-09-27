import turtle

t = turtle.Turtle()

t.fillcolor("red")

t.begin_fill()

t.circle(100)

t.left(60)
t.forward(80)
t.left(120)
t.forward(80)
t.left(120)
t.forward(80)

t.end_fill()

t.hideturtle()

turtle.exitonclick()