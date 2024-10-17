def shape3(n):
    if n%2!=0:
        mid = n//2 
        i=0
        while i<n:
            j = 0
            if i == mid:
                while j<n:
                    print("* ",end = '')
                    j+=1
            elif i < mid:
                z=i
                if i==0:
                    while j < n :
                        if j == 0:
                            print("* ",end="")
                        else:
                            print("  ",end="")
                        j+=1
                else:
                    while j<n:
                        if j == 0 or j == z:
                            print("* ",end="")
                        else:
                            print("  ",end="")
                        j+=1
            
            else:
                if i+1==n:
                    while j < n :
                        if j + 1 == n:
                            print("* ",end="")
                        else:
                            print("  ",end="")
                        j+=1
                else:
                    while j<n:
                        if j+1 == n or j == z:
                            print("* ",end="")
                        else:
                            print("  ",end="")
                        j+=1
                        z-=1
            print()
            i+=1
shape3(7)