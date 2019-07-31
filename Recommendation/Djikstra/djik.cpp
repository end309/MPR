#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <utility>
#include <limits>

using namespace std;

int mindist(int* dist, bool* spset){
    int m = INT_MAX, min_idx ;

    for(int i = 0 ; i < 38485 ; i++){
        if(spset[i]==false && dist[i]<m){
            m = dist[i] ;
            min_idx = i ;
        }
    }
    return min_idx ;
}

int main()
{

vector< pair<int, int> > graph[38485] ;
fstream file("distances.csv");
string content;

while(file >> content) {
    string str = content ;
    string word;
    stringstream stream(str);
    int idx, src, dest, weight ;
    int x = 0 ;
    while( getline(stream, word, ',') && x<4){
        if(x==0){
            x++ ;
            continue ;
        }
        if(x==1){
            stringstream num(word) ;
            src = 0 ;
            num >> src ;
            x++ ;
            continue ;
        }
        if(x==2){
            stringstream num(word) ;
            dest = 0 ;
            num >> dest ;
            x++ ;
            continue ;
        }
        if(x==3){
            stringstream num(word) ;
            weight = 0 ;
            num >> weight ;
            x++ ;
            continue ;
        }
    }

    graph[src].push_back(make_pair(dest, weight) ) ;
}


int x, y ;
cout << "Enter the source and destination vertices" << endl ;
cin >> x >> y ;

int parent[38485] ;
int dist[38485] ;
bool spset[38485] ;

for(int i = 0 ; i < 38485 ; i++){
    parent[i] = -1 ;
    dist[i] = INT_MAX ;
    spset[i] = false ;
}

dist[x] = 0 ;

for(int i = 0 ; i < 38484 ; i++){
 int u = mindist(dist, spset) ;
 spset[u] = true ;

 for(int j = 0 ; j < graph[u].size() ; j++)
   if(!spset[graph[u][j].first] && dist[u]+graph[u][j].second < dist[graph[u][j].first]) {
    parent[graph[u][j].first] = u ;
    dist[graph[u][j].first] = dist[u]+graph[u][j].second  ;
   }
}

if(dist[y]==INT_MAX){
    cout << "Sorry, no path found between the source and destination" << endl ;
}
else{
cout << "distance is " << dist[y] << endl ;
cout << endl ;

cout << "Now showing the distance in reverse " << endl ;

/*
for(int i = 0 ; i < 38485 ; i++){
    if(dist[i]<INT_MAX){
        cout << i << " " << dist[i] << endl ;
    }
}*/

int p = parent[y] ;
cout << y << " " ;

while(p!=-1){
    cout << p << " " ;
    p = parent[p] ;
}
}

}
