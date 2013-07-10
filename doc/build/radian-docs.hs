{-# LANGUAGE OverloadedStrings #-}
module Main where

import Data.Monoid (mappend, (<>))
import Hakyll



-- | Set up deployment command.
--
hakyllConf :: Configuration
hakyllConf = defaultConfiguration {
  deployCommand = "cp -r _site/* ../../Radian-pages"
  }


-- | Top-level pages.
--
pages :: Pattern
pages = fromList ["changelog.markdown", "community.markdown",
                  "documentation.markdown", "download.markdown",
                  "faq.markdown", "roadmap.markdown", "index.markdown",
                  "license.markdown", "contact.markdown"]


-- | Directories with more pages.
--
directories :: Pattern
directories = foldl1 (.||.) $ map doone ds
  where doone d = fromGlob (d <> "/*.markdown") .||.
                  fromGlob (d <> "/**/*.markdown")
        ds = ["gallery", "posts", "ref-manual", "tutorial"]


-- | Main program: adds a "publish" option to copy a draft out to the
-- main posts area.
--
main :: IO ()
main = hakyllWith hakyllConf $ do
  match "templates/*" $ compile templateCompiler

  match "css/*" $ do
    route idRoute
    compile copyFileCompiler

  match "js/*" $ do
    route idRoute
    compile copyFileCompiler

  match "font/*" $ do
    route idRoute
    compile copyFileCompiler

  match "downloads/*" $ do
    route idRoute
    compile copyFileCompiler

  match "gallery/eg/*" $ do
    route idRoute
    compile copyFileCompiler

  match "favicon.ico" $ do
    route idRoute
    compile copyFileCompiler

  match pages $ do
    route $ setExtension ".html"
    compile $ pandocCompiler
      >>= loadAndApplyTemplate "templates/default.html" defaultContext
      >>= relativizeUrls

  match directories $ do
    route $ setExtension ".html"
    compile $ pandocCompiler
      >>= loadAndApplyTemplate "templates/default.html" defaultContext
      >>= relativizeUrls

  match "img/*" $ do
    route idRoute
    compile copyFileCompiler

  match "data/**" $ do
    route idRoute
    compile copyFileCompiler

  match "posts/*.markdown" $ do
    route $ setExtension ".html"
    compile $ pandocCompiler
      >>= loadAndApplyTemplate "templates/post.html"    postCtx
      >>= loadAndApplyTemplate "templates/default.html" postCtx
      >>= relativizeUrls


-- | Context for posts.
--
postCtx :: Context String
postCtx = dateField "date" "%B %e, %Y" `mappend` defaultContext
