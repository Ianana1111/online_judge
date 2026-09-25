Larger base prices suffer more from a later, larger exponent, so sort prices descending and assign years 1,2,... in that order. Then compute each exact integer power and accumulate twice it.

Only whether the budget is exceeded matters. Before multiplying power by the price, compare against `budget/2/price`; if larger, that term is already unaffordable. Read unrestricted-size price tokens digit by digit and cap them at `budget+1`, preserving the conclusion that they are too expensive without overflowing. Consume the entire case before evaluating it.

Assign larger prices smaller exponents; each cost is 2×price^(position+1), and stop once the five-million budget is exceeded.
