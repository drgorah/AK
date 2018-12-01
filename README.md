# Thus Spake A.K.


Of the myriad aspects of programming, numerical computing is perhaps the one that most programmers are least familiar with, which is a pity since it is, in my opinion, one of the most interesting. In an attempt to increase understanding of the subject within the programming community I've decided to implement, and blog about implementing, a rudimentary numerical library.

In JavaScript.

Before you decide that I should be forcibly relocated to a padded cubicle I'd like to make it absolutely clear that JavaScript is not remotely my language of choice for such a project. No, my preferred language is C++; operator overloading and value types make using mathematical objects a breeze and templates and inlining help make them efficient. Hopefully only die hard Fortran programmers will still think that I'm insane. However, I'm a firm believer that the best way to learn how algorithms work is to use them. If I were to implement my library in C++, reading about it would be laboriously interrupted with downloading and compiling code. Much better then for the code to be run directly in the browser and, for better or for worse, that means JavaScript.
As a complete newcomer to the language I have more or less followed the advice that Douglas Crockford gives in his book JavaScript: The Good Parts, but as a dyed-in-the-wool C++ programmer I'm reasonably certain that some of my design choices will be far from idiomatic. One piece of advice that was not so hard to take to heart was to avoid polluting the global environment with objects and functions by instead creating a single global object and subsequently making everything a member of it; in deference to al-Khwarizmi I have named mine ak.

You can follow my progress at www.thusspakeak.com, or simply jump to the code's documentation at www.thusspakeak.com/contents.html#Library and the unit tests at www.thusspakeak.com/ak/tests.html.

