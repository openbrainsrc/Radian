module Layout where

import Data.Ratio
import Data.Maybe
import Data.Array
import Control.Arrow (first)
import Control.Monad (mapM_)

-- How much relative space a plot takes up in the layout direction.
type Space = Maybe (Ratio Int)

-- A layout is made up of frames arranged in horizontal boxes and
-- vertical boxes.  Frames are just their titles here.
data Layout a = HBox [(a, Layout a)]
              | VBox [(a, Layout a)]
              | Frame String
              deriving (Eq, Show)

-- Specialisation for the input type of layouts where we specify
-- ratios of the available space used by frames, and the final layed
-- out version, which gives the exact sizes of everything.
type LayoutIn = Layout Space
type Layedout = Layout Int

-- Fix ratios...
fixrat :: Ratio Int -> [(Space, LayoutIn)] -> [(Space, LayoutIn)]
fixrat r = map (first (fmap (* r)))

-- Operators for laying out frames.
(|||) :: LayoutIn -> LayoutIn -> LayoutIn
(HBox ps)   ||| p@(Frame _) = HBox $ ps ++ [(Nothing, p)]
p@(Frame _) ||| (HBox ps)   = HBox $ (Nothing, p) : ps
p1          ||| p2          = HBox [(Nothing, p1), (Nothing, p2)]

(%||) :: (Ratio Int, LayoutIn) -> LayoutIn -> LayoutIn
(r, HBox ps)     %|| p@(Frame _) = HBox $ fixrat r ps ++ [(Nothing, p)]
(r, p@(Frame _)) %|| (HBox ps)   = HBox $ (Just r, p) : ps
(r, p1)          %|| p2          = HBox [(Just r, p1), (Nothing, p2)]

(%|%) :: (Ratio Int, LayoutIn) -> (Ratio Int, LayoutIn) -> LayoutIn
(r1, HBox ps)     %|% (r2, p@(Frame _)) = HBox $ fixrat r1 ps ++ [(Just r2, p)]
(r1, p@(Frame _)) %|% (r2, HBox ps)     = HBox $ (Just r1, p) : fixrat r2 ps
(r1, p1)          %|% (r2, p2)          = HBox [(Just r1, p1), (Just r2, p2)]

(||%) :: LayoutIn -> (Ratio Int, LayoutIn) -> LayoutIn
p@(Frame _) ||% (r, HBox ps)     = HBox $ (Nothing, p) : fixrat r ps
(HBox ps)   ||% (r, p@(Frame _)) = HBox $ ps ++ [(Just r, p)]
p2          ||% (r, p1)          = HBox [(Nothing, p1), (Just r, p2)]

(===) :: LayoutIn -> LayoutIn -> LayoutIn
(VBox ps)   === p@(Frame _) = VBox $ ps ++ [(Nothing, p)]
p@(Frame _) === (VBox ps)   = VBox $ (Nothing, p) : ps
p1          === p2          = VBox [(Nothing, p1), (Nothing, p2)]

(%==) :: (Ratio Int, LayoutIn) -> LayoutIn -> LayoutIn
(r, VBox ps)     %== p@(Frame _) = VBox $ fixrat r ps ++ [(Nothing, p)]
(r, p@(Frame _)) %== (VBox ps)   = VBox $ (Just r, p) : ps
(r, p1)          %== p2          = VBox [(Just r, p1), (Nothing, p2)]

(%=%) :: (Ratio Int, LayoutIn) -> (Ratio Int, LayoutIn) -> LayoutIn
(r1, VBox ps)     %=% (r2, p@(Frame _)) = VBox $ fixrat r1 ps ++ [(Just r2, p)]
(r1, p@(Frame _)) %=% (r2, VBox ps)     = VBox $ (Just r1, p) : fixrat r2 ps
(r1, p1)          %=% (r2, p2)          = VBox [(Just r1, p1), (Just r2, p2)]

(==%) :: LayoutIn -> (Ratio Int, LayoutIn) -> LayoutIn
(VBox ps)   ==% (r, p@(Frame _)) = VBox $ ps ++ [(Just r, p)]
p@(Frame _) ==% (r, VBox ps)     = VBox $ (Nothing, p) : fixrat r ps
p1          ==% (r, p2)          = VBox [(Nothing, p1), (Just r, p2)]


-- Some frames.
a, b, c, d :: LayoutIn
a = Frame "A"
b = Frame "B"
c = Frame "C"
d = Frame "D"

-- Some layouts.
l1, l2, l3, l4, l5, l6 :: LayoutIn
l1 = a ||| b
l2 = a === b
l3 = (a ||| b) === (c ||| d)
l4 = (a === b === c) ||| d
l5 = (3, a) %|% (2, b)
l6 = a ==% (1,b) ==% (3,c)

-- Determine sizes of frames in a layout.
calcSizes :: (Int, Int, Int) -> LayoutIn -> Layedout
calcSizes (w, h, spc) (Frame s) = HBox [(w, VBox [(h, Frame s)])]
calcSizes (w, h, spc) p@(HBox _) = VBox [(h, calcSizes' (w, h, spc) p)]
calcSizes (w, h, spc) p@(VBox _) = HBox [(w, calcSizes' (w, h, spc) p)]

calcSizes' :: (Int, Int, Int) -> LayoutIn -> Layedout
calcSizes' (w, h, spc) (HBox ps) = HBox $ zipWith recurse sizes (map snd ps)
  where sizes = fitSizes w spc $ map fst ps
        recurse fw p = (fw, calcSizes' (fw, h, spc) p)
calcSizes' (w, h, spc) (VBox ps) = VBox $ zipWith recurse sizes (map snd ps)
  where sizes = fitSizes h spc $ map fst ps
        recurse fh p = (fh, calcSizes' (w, fh, spc) p)
calcSizes' (_, _, _) (Frame s) = Frame s

-- Fit a range of space parameters into a given size and spacing.
fitSizes :: Int -> Int -> [Space] -> [Int]
fitSizes w s ws = widths
  where realw = w - s * (length ws - 1)
        mean = case catMaybes ws of
          [] -> 1
          vs -> sum vs / (fromIntegral $ length vs)
        realvals = map (maybe mean id) ws
        realtot = sum realvals
        tmpwidths = map (floor . (* (realw % 1)) . (/ realtot)) realvals
        wdiff = realw - sum tmpwidths
        spc = length ws `div` wdiff
        ds = cycle (1 : take spc (repeat 0))
        widths = if wdiff == 0 then tmpwidths else zipWith (+) tmpwidths ds

-- Render a layout as strings.
doRender :: (Int,Int,Int) -> Layedout -> [String]
doRender (w,h,s) l = toStrings (w,h) $ foldl renderOne empty frames
  where empty = listArray ((1,1), (w,h)) (repeat ' ')
        frames = extractFrames s (1,1) (w,h) l

-- Full render.
render :: (Int,Int,Int) -> LayoutIn -> IO ()
render (w,h,s) ls = mapM_ putStrLn $ doRender (w,h,s) $ calcSizes (w,h,s) ls

type View = (Int,Int,Int,Int,String)
type Board = Array (Int,Int) Char

-- Extract frames with positions from layout.
extractFrames :: Int -> (Int,Int) -> (Int,Int) -> Layedout -> [View]
extractFrames spc (curx,cury) (_,h) (HBox ps) =
  snd $ foldl addone ((curx,cury),[]) ps
  where addone ((x,y),acc) (fw,Frame s) = ((x+fw+spc,y), acc ++ [(x,y,fw,h,s)])
        addone ((x,y),acc) (vw,vb@(VBox _)) =
          ((x+vw+spc,y), acc ++ extractFrames spc (x,y) (vw,h) vb)
extractFrames spc (curx,cury) (w,_) (VBox ps) =
  snd $ foldl addone ((curx,cury),[]) ps
  where addone ((x,y),acc) (fh,Frame s) = ((x,y+fh+spc), acc ++ [(x,y,w,fh,s)])
        addone ((x,y),acc) (hh,hb@(HBox _)) =
          ((x,y+hh+spc), acc ++ extractFrames spc (x,y) (w,hh) hb)

-- Render one frame.
renderOne :: Board -> View -> Board
renderOne arr (x,y,w,h,s) = arr // (corners ++ sides ++ label)
  where corners = zip [(x,y),(x+w-1,y),(x,y+h-1),(x+w-1,y+h-1)] (repeat '+')
        sides = lside ++ rside ++ tside ++ bside
        lside = [((x,iy),'|')     | iy <- [y+1..y+h-2]]
        rside = [((x+w-1,iy),'|') | iy <- [y+1..y+h-2]]
        tside = [((ix,y),'-')     | ix <- [x+1..x+w-2]]
        bside = [((ix,y+h-1),'-') | ix <- [x+1..x+w-2]]
        label = zip lcoords s
        lcoords = [(ix,y+h`div`2) | ix <- [x+w`div`2-(length s)`div`2..]]

-- Convert array representation to strings.
toStrings :: (Int,Int) -> Board -> [String]
toStrings (w,h) arr = [[ arr!(col,row) | col <- [1..w]] | row <- [1..h]]
